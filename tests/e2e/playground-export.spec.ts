import { readFileSync } from 'node:fs';

import { test, expect, type Page } from '@playwright/test';

import { DOCS_SITE_URL } from '../helpers/docs-site.js';

const PLAYGROUND_URL = `${DOCS_SITE_URL}/playground`;
const EXPORT_SVG = 'Export SVG';
const EXPORT_PNG = 'Export PNG';
const PNG_SCALE = 2;
const DARK_CHANNEL = 128;
// The docs dev server compiles the whole library, unbundled, on first load, and
// that wait counts against the test's own timeout.
const FIRST_LOAD_TIMEOUT_MS = 60_000;
const TEST_TIMEOUT_MS = 90_000;

const CLASS_DIAGRAM = '@startuml\nclass A\nA --> B\n@enduml';
const TRANSPARENT_DIAGRAM = '@startuml\nskinparam backgroundColor transparent\nA -> B\n@enduml';
// Math is an <image> holding a nested SVG with a <foreignObject>: the payload
// that taints the canvas when the outer SVG comes from a blob: URL.
const MATH_DIAGRAM = '@startuml\n:<latex>x^2</latex>;\n@enduml';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function openWith(page: Page, source: string): Promise<void> {
  await page.goto(PLAYGROUND_URL);
  await page.waitForSelector('.pu-svg svg', { timeout: FIRST_LOAD_TIMEOUT_MS });
  const before = await page.$eval('.pu-svg', (host) => host.innerHTML);
  await page.fill('.pu-input', source);
  await page.waitForFunction((previous) => document.querySelector('.pu-svg')?.innerHTML !== previous, before);
}

async function download(page: Page, button: string): Promise<{ name: string; bytes: Buffer }> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: button }).click();
  const file = await pending;
  return { name: file.suggestedFilename(), bytes: readFileSync(await file.path()) };
}

/** Decodes `png` in the page; returns its size, top-left RGBA, and dark pixels inside `box`. */
function inspectPng(page: Page, png: Buffer, box?: Box) {
  return page.evaluate(
    async ({ base64, box, dark }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${base64}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const area = box ?? { x: 0, y: 0, width: img.width, height: img.height };
      const { data } = ctx.getImageData(area.x, area.y, area.width, area.height);
      let darkPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3]! > 0 && data[i]! < dark) darkPixels++;
      }
      return {
        width: img.width,
        height: img.height,
        corner: [...ctx.getImageData(0, 0, 1, 1).data],
        darkPixels,
      };
    },
    { base64: png.toString('base64'), box, dark: DARK_CHANNEL },
  );
}

/** The live preview's root size, in the SVG's own CSS pixels. */
function rootSize(page: Page) {
  return page.$eval('.pu-svg svg', (svg) => ({
    width: Number.parseFloat(svg.getAttribute('width')!),
    height: Number.parseFloat(svg.getAttribute('height')!),
  }));
}

test.describe('playground export', () => {
  test.describe.configure({ timeout: TEST_TIMEOUT_MS });

  let pageErrors: string[];

  test.beforeEach(({ page }) => {
    pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
  });

  test('SVG is the library output, without the preview-only zoom-to-fit', async ({ page }) => {
    await openWith(page, CLASS_DIAGRAM);

    const { name, bytes } = await download(page, EXPORT_SVG);

    const markup = bytes.toString('utf8');
    expect(name).toBe('diagram.svg');
    expect(markup.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(markup).toContain('preserveAspectRatio="none"');
    await expect(page.locator('.pu-svg svg')).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  });

  test('PNG is twice the SVG size and paints the root background', async ({ page }) => {
    await openWith(page, CLASS_DIAGRAM);
    const size = await rootSize(page);

    const { name, bytes } = await download(page, EXPORT_PNG);

    const png = await inspectPng(page, bytes);
    expect(name).toBe('diagram.png');
    expect({ width: png.width, height: png.height }).toEqual({
      width: size.width * PNG_SCALE,
      height: size.height * PNG_SCALE,
    });
    expect(png.corner).toEqual([255, 255, 255, 255]);
  });

  test('PNG of a transparent diagram stays transparent', async ({ page }) => {
    await openWith(page, TRANSPARENT_DIAGRAM);

    const { bytes } = await download(page, EXPORT_PNG);

    const png = await inspectPng(page, bytes);
    expect(png.corner).toEqual([0, 0, 0, 0]);
  });

  test('PNG of a math diagram downloads with the math painted', async ({ page }) => {
    await openWith(page, MATH_DIAGRAM);
    const math = await page.$eval('.pu-svg svg image', (image) => ({
      x: Number(image.getAttribute('x')),
      y: Number(image.getAttribute('y')),
      width: Number(image.getAttribute('width')),
      height: Number(image.getAttribute('height')),
    }));

    const { bytes } = await download(page, EXPORT_PNG);

    const png = await inspectPng(page, bytes, {
      x: Math.floor(math.x * PNG_SCALE),
      y: Math.floor(math.y * PNG_SCALE),
      width: Math.floor(math.width * PNG_SCALE),
      height: Math.floor(math.height * PNG_SCALE),
    });
    expect(png.darkPixels).toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
    await expect(page.locator('.pu-export-error')).toHaveCount(0);
  });

  test('a throwing PNG encoder is reported and keeps the preview', async ({ page }) => {
    await openWith(page, CLASS_DIAGRAM);
    await page.evaluate(() => {
      HTMLCanvasElement.prototype.toBlob = () => {
        throw new Error('encoder threw');
      };
    });

    await page.getByRole('button', { name: EXPORT_PNG }).click();

    await expect(page.locator('.pu-export-error')).toHaveText('PNG export failed: encoder threw');
    await expect(page.locator('.pu-svg svg')).toHaveCount(1);
    expect(pageErrors).toEqual([]);
  });

  test('an encoder returning no blob is reported, and the next export clears it', async ({ page }) => {
    await openWith(page, CLASS_DIAGRAM);
    await page.evaluate(() => {
      HTMLCanvasElement.prototype.toBlob = (callback) => callback(null);
    });

    await page.getByRole('button', { name: EXPORT_PNG }).click();
    await expect(page.locator('.pu-export-error')).toHaveText('PNG export failed: PNG encoding failed');

    await download(page, EXPORT_SVG);
    await expect(page.locator('.pu-export-error')).toHaveCount(0);
  });
});
