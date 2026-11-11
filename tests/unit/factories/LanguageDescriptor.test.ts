import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LanguageDescriptor } from '../../../src/core/syntax/LanguageDescriptor.js';

const CORPUS = new URL('../../../test-results/dot-cache/unknown/', import.meta.url);

/** The help page's three header lines: title, blank, "The possible … are :". */
const HEADER_LINES = 3;

/** Every `<text>` body of a cached jar render, entity-decoded, after the header. */
function jarList(slug: string): string[] {
  const svg = readFileSync(new URL(`${slug}/in.svg`, CORPUS), 'utf8');
  const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) =>
    m[1]!.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'),
  );
  return texts.slice(HEADER_LINES);
}

describe('LanguageDescriptor', () => {
  it('getKeyword() is the jar `help keyword` list, in TreeSet order (mefure-90-gitu244)', () => {
    expect([...new LanguageDescriptor().getKeyword()]).toEqual(jarList('mefure-90-gitu244'));
  });

  it('getType() is the jar `help type` list, in TreeSet order (xasanu-61-guze787)', () => {
    expect([...new LanguageDescriptor().getType()]).toEqual(jarList('xasanu-61-guze787'));
  });

  it('getPreproc() holds the preprocessor directives, sorted by UTF-16 code unit', () => {
    const preproc = [...new LanguageDescriptor().getPreproc()];
    expect(preproc[0]).toBe('!assert');
    expect(preproc.at(-1)).toBe('!while');
    expect(preproc).toEqual([...preproc].sort());
  });

  it('every @start keyword has its @end pair', () => {
    const keyword = new LanguageDescriptor().getKeyword();
    for (const k of keyword)
      if (k.startsWith('@start')) expect(keyword.has(`@end${k.slice('@start'.length)}`)).toBe(true);
  });
});
