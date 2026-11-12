<!-- SPDX-License-Identifier: MIT -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
// Aliased in .vitepress/config.ts to the real library source (src/index.ts,
// D2), so the playground always runs exactly what ships.
import { renderSync } from '@knowvah/plantuml-engine';
// Client-side PlantUML syntax highlighting, reusing the SAME grammar the docs
// code blocks use (single source of truth). Shiki runs in the browser here
// over a transparent-textarea overlay with its pure-JS regex engine (no
// WASM); the plain textarea still works if it fails to load (progressive
// enhancement). Ported from dot-atlassian's DOT playground.
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import githubLight from '@shikijs/themes/github-light';
import githubDark from '@shikijs/themes/github-dark';
import { plantumlLang } from '../plantuml.tmLanguage';

const DEFAULT_SOURCE = `@startuml
class Animal {
  -name: String
  #age: int
  +makeSound(): void
}

class Dog extends Animal {
  +breed: String
  +fetch(): void
}

class Cat extends Animal {
  +indoor: boolean
  +scratch(): void
}

interface Pet {
  +play(): void
}

Dog ..|> Pet
Animal "1" -- "0..*" Toy : owns >

class Toy {
  +name: String
}
@enduml`;

const props = defineProps<{
  initial?: string;
  height?: string;
}>();

const source = ref(props.initial ?? DEFAULT_SOURCE);
const svg = ref('');
const error = ref('');
const exportError = ref('');
const svgHost = ref<HTMLElement | null>(null);

// Zoom-to-fit. The jar-faithful root carries preserveAspectRatio="none",
// which stretches the drawing whenever the box's proportions differ from
// the viewBox. Display-only: the library's output keeps the jar's value.
function fitSvg(): void {
  svgHost.value?.querySelector('svg')?.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}

// --- syntax-highlight overlay ---
const highlighted = ref('');
const overlaid = ref(false); // true once the highlighter has painted a layer
const highlightEl = ref<HTMLElement | null>(null);
let highlighter: HighlighterCore | undefined;

function paintHighlight(): void {
  if (!highlighter) return;
  // Trailing newline keeps the highlight layer's height in step with the
  // textarea while the last line is being typed.
  highlighted.value = highlighter.codeToHtml(`${source.value}\n`, {
    lang: 'plantuml',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
  overlaid.value = true;
}

function syncScroll(e: Event): void {
  const ta = e.target as HTMLTextAreaElement;
  if (highlightEl.value) {
    highlightEl.value.scrollTop = ta.scrollTop;
    highlightEl.value.scrollLeft = ta.scrollLeft;
  }
}

function renderNow(): void {
  // Render is client-only — CanvasMeasurer needs the DOM <canvas> API, which
  // is unavailable during VitePress's Node-side SSR pass.
  if (typeof window === 'undefined') return;
  try {
    svg.value = renderSync(source.value);
    error.value = '';
  } catch (e) {
    // renderSync() catches its own parse/layout errors and returns an error
    // SVG rather than throwing, but this guards against any other
    // unexpected failure so the pane never goes blank or silent.
    svg.value = '';
    error.value = e instanceof Error ? e.message : String(e);
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;

function scheduleRender(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(renderNow, 250);
}

onMounted(async () => {
  renderNow();
  try {
    highlighter = await createHighlighterCore({
      themes: [githubLight, githubDark],
      langs: [plantumlLang],
      // Pure-JS regex engine: the grammar is simple enough that the
      // JavaScript engine covers it fully, and it keeps the site free of
      // WASM (the Oniguruma engine ships a .wasm binary).
      engine: createJavaScriptRegexEngine(),
    });
    paintHighlight();
  } catch {
    // Highlighter unavailable — the plain (visible) textarea keeps working.
  }
});

// --- export ---
// Raster scale for PNG export: 2× the SVG's CSS-pixel size so the image stays
// crisp on high-DPI displays and when zoomed.
const PNG_SCALE = 2;
const EXPORT_BASENAME = 'diagram';
const SVG_MIME = 'image/svg+xml';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // Defer revocation so the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportSvg(): void {
  exportError.value = '';
  // svg.value is the library's own output: fitSvg() only touches the live DOM.
  downloadBlob(new Blob([svg.value], { type: SVG_MIME }), `${EXPORT_BASENAME}.svg`);
}

function loadSvgImage(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not rasterize the SVG'));
    // A data: URL, not a blob: URL. Math is an <image> whose nested SVG holds a
    // <foreignObject>, and Chromium taints the canvas for that payload only
    // when the outer SVG came from a blob: URL; toBlob then throws.
    img.src = `data:${SVG_MIME};charset=utf-8,${encodeURIComponent(markup)}`;
  });
}

async function svgToPng(markup: string): Promise<Blob> {
  const img = await loadSvgImage(markup);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(img.naturalWidth * PNG_SCALE);
  canvas.height = Math.ceil(img.naturalHeight * PNG_SCALE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  // No background fill: the root's own CSS background paints in the raster, and
  // `skinparam backgroundColor transparent` omits it, so the PNG stays clear.
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  // Inside the executor so a throwing toBlob (a canvas still tainted, as other
  // engines may do) rejects instead of escaping as an uncaught error.
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}

async function exportPng(): Promise<void> {
  exportError.value = '';
  try {
    downloadBlob(await svgToPng(svg.value), `${EXPORT_BASENAME}.png`);
  } catch (e) {
    // Reported beside the buttons, not through `error`: that swaps the preview
    // out for the message, and a failed export says nothing about the diagram.
    exportError.value = `PNG export failed: ${e instanceof Error ? e.message : String(e)}`;
  }
}

watch(svg, fitSvg, { flush: 'post' });

watch(source, () => {
  paintHighlight();
  scheduleRender();
});
</script>

<template>
  <div class="pu-playground">
    <div class="pu-toolbar">
      <span v-if="exportError" class="pu-export-error" role="alert">{{ exportError }}</span>
      <div class="pu-export">
        <button type="button" :disabled="!svg || !!error" @click="exportSvg">Export SVG</button>
        <button type="button" :disabled="!svg || !!error" @click="exportPng">Export PNG</button>
      </div>
    </div>
    <div class="pu-panes" :style="{ height: props.height ?? '480px' }">
      <div class="pu-editor">
        <div ref="highlightEl" class="pu-highlight" aria-hidden="true" v-html="highlighted"></div>
        <textarea
          v-model="source"
          class="pu-input"
          :class="{ overlaid }"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          aria-label="PlantUML source"
          @scroll="syncScroll"
        ></textarea>
      </div>
      <div class="pu-output" aria-label="Rendered SVG">
        <pre v-if="error" class="pu-error">{{ error }}</pre>
        <!-- Code review: playground v-html has no CSP; only self-XSS reachable today (no URL-reflection or share-link mechanism found). Revisit immediately if a share/permalink feature is added, or once the javascript: href fix lands. -->
        <div v-else ref="svgHost" class="pu-svg" v-html="svg"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pu-playground {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
}
.pu-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
}
.pu-export {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}
.pu-export button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0.15rem 0.6rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}
.pu-export button:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.pu-export button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pu-export-error {
  color: var(--vp-c-danger-1);
}
.pu-panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
/* Editor: a highlighted layer behind a transparent textarea. Both must share
   identical text metrics so the caret lines up with the painted glyphs. */
.pu-editor {
  position: relative;
  border-right: 1px solid var(--vp-c-divider);
  overflow: hidden;
  background: var(--vp-c-bg);
}
.pu-highlight,
.pu-input {
  margin: 0;
  padding: 0.75rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  line-height: 1.5;
  tab-size: 4;
  white-space: pre;
  word-wrap: normal;
  overflow-wrap: normal;
  border: none;
  box-sizing: border-box;
}
.pu-highlight {
  position: absolute;
  inset: 0;
  overflow: auto;
  pointer-events: none;
}
.pu-highlight :deep(pre.shiki) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  font: inherit;
}
.pu-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  resize: none;
  outline: none;
  background: transparent;
  color: var(--vp-c-text-1); /* visible until the highlight layer paints */
  caret-color: var(--vp-c-text-1);
  overflow: auto;
}
.pu-input.overlaid {
  color: transparent; /* text is shown by the layer behind; keep the caret */
}
.pu-output {
  overflow: auto;
  padding: 0.75rem;
  background: #fff;
}
/* Zoom-to-fit: the SVG fills the pane both ways, up or down, keeping its
   proportions (fitSvg() sets xMidYMid meet). !important is required: the
   jar-faithful root sets width/height in an inline style attribute, which
   outranks any stylesheet rule. On narrow screens the pane height is auto,
   so height falls back to the viewBox aspect ratio. */
.pu-svg {
  width: 100%;
  height: 100%;
}
.pu-svg :deep(svg) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
.pu-error {
  color: var(--vp-c-danger-1);
  white-space: pre-wrap;
  font-size: 0.8rem;
  margin: 0;
}
@media (max-width: 640px) {
  .pu-panes {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    height: auto !important;
  }
}
</style>

<style>
/* UNSCOPED on purpose. defaultColor:false emits token colors as
   --shiki-light/--shiki-dark CSS variables, not a `color`; these rules map
   them to the live color, switching on VitePress's html.dark. They cannot
   live in the scoped block: Vue does not support :global() as an ancestor
   combinator, so a scoped `html.dark …` rule never matches and dark mode
   would paint the light palette onto the dark background. */
.pu-playground .pu-highlight .shiki,
.pu-playground .pu-highlight .shiki span {
  color: var(--shiki-light);
}
html.dark .pu-playground .pu-highlight .shiki,
html.dark .pu-playground .pu-highlight .shiki span {
  color: var(--shiki-dark);
}
</style>
