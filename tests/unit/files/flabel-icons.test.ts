/**
 * `FLabel`, `FilesIcons` and `TreePrefix` (upstream 2627edbf223, #3010). The rendered effect of each is checked
 * against the jar through the vega fixtures annotations/icons/no_connectors/legacy_dark (zero diffs, probed with
 * `scripts/oracle-render.sh`).
 */
import { describe, expect, it } from 'vitest';
import { FEntry } from '../../../src/diagrams/files/ast.js';
import { FLabel, isColor } from '../../../src/diagrams/files/flabel.js';
import { FilesIcons, toCreole } from '../../../src/diagrams/files/files-icons.js';
import { TreePrefix } from '../../../src/diagrams/files/tree-prefix.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const OPTIONS = { measurer: new DeterministicMeasurer() };

describe('FLabel.parse (FLabel.java:75-160)', () => {
  it('a bare name has no annotation', () => {
    const label = FLabel.parse('App.java');
    expect([label.getName(), label.getDescription(), label.getColor(), label.getIcon()]).toEqual([
      'App.java',
      null,
      null,
      null,
    ]);
    expect(label.getStereotypes()).toEqual([]);
  });

  it('reads :::stereotype, <<stereotype>>, #color, icon() and ## description in any order', () => {
    const label = FLabel.parse('App.java :::highlight <<todo>> #red icon(:rocket:) ## the entry point');
    expect(label.getName()).toBe('App.java');
    expect(label.getStereotypes()).toEqual(['highlight', 'todo']);
    expect(label.getColor()).toBe('#red');
    expect(label.getIcon()).toBe(':rocket:');
    expect(label.getDescription()).toBe('the entry point');
  });

  it('annotations written after the description still count', () => {
    const label = FLabel.parse('App.java ## the entry point :::highlight');
    expect(label.getDescription()).toBe('the entry point');
    expect(label.getStereotypes()).toEqual(['highlight']);
  });

  it('a quoted name keeps its blanks and its #', () => {
    expect(FLabel.parse('"my file #1.txt" :::x').getName()).toBe('my file #1.txt');
  });

  it('a word that only looks like a color stays in the name', () => {
    expect(FLabel.parse('issue #12').getName()).toBe('issue #12');
    expect(FLabel.parse('todo #todo').getName()).toBe('todo #todo');
  });

  it('isColor accepts hex of 3, 4, 6 or 8 digits and named colors only (FLabel.java:222-231)', () => {
    expect([
      isColor('#FFC107'),
      isColor('#fff'),
      isColor('#12'),
      isColor('#red'),
      isColor('#todo'),
      isColor('x'),
    ]).toEqual([true, true, false, true, false, false]);
  });
});

describe('TreePrefix.parse (TreePrefix.java:60-95)', () => {
  it('GNU tree: the name starts after the branch and its blanks; it is not a folder', () => {
    const prefix = TreePrefix.parse('│   ├── a.ts');
    expect([prefix.getColumn(), prefix.isFolder()]).toEqual([8, false]);
  });

  it('Windows tree: three dashes glued to the name make a folder', () => {
    const prefix = TreePrefix.parse('+---bin');
    expect([prefix.getColumn(), prefix.isFolder()]).toEqual([4, true]);
  });

  it('plain indentation is its own column', () => {
    expect(TreePrefix.parse('    a').getColumn()).toBe(4);
  });
});

describe('FilesIcons (FilesIcons.java:42-242)', () => {
  const fileOf = (name: string): FEntry => FEntry.createRoot().addRawEntry(name);

  it('picks the icon by extension, longest extension first, then by name, else the default page', () => {
    const icons = new FilesIcons();
    expect(icons.getIcon(fileOf('App.java'))).toBe('<:coffee:>');
    expect(icons.getIcon(fileOf('archive.tar.gz'))).toBe('<:package:>');
    expect(icons.getIcon(fileOf('Dockerfile'))).toBe('<:whale:>');
    expect(icons.getIcon(fileOf('unknown.xyz'))).toBe('<:1f4c4:>');
    expect(icons.getIcon(FEntry.createRoot().addRawEntry('d/'))).toBe('<:1f4c2:>');
  });

  it('[icon <pattern> <icon>] rules beat the built-in ones', () => {
    const icons = new FilesIcons();
    expect(icons.declare('[icon *.java <:gem:>]')).toBe(true);
    expect(icons.declare('[icon */ <&folder>]')).toBe(true);
    expect(icons.getIcon(fileOf('App.java'))).toBe('<:gem:>');
    expect(icons.getIcon(FEntry.createRoot().addRawEntry('d/'))).toBe('<&folder>');
    expect(icons.declare('not a rule')).toBe(false);
  });

  it('toCreole turns the spellings of an icon into creole: none is empty, an unknown name is null', () => {
    expect([
      toCreole('none'),
      toCreole(':rocket:'),
      toCreole('&folder'),
      toCreole('rocket'),
      toCreole('zz zz'),
    ]).toEqual(['', '<:rocket:>', '<&folder>', '<:rocket:>', null]);
  });
});

describe('rendering the annotations (vega annotations.puml, jar probe)', () => {
  const svg = renderSync('@startfiles\nsrc/\n    App.java :::highlight\n    Brand.java #lightblue\n@endfiles', OPTIONS);

  it(':::highlight takes the predefined .highlight style, #color its own fill', () => {
    expect(svg).toContain('fill="#FFF3CD" style="stroke:#FFC107;stroke-width:1;"');
    expect(svg).toContain('fill="#ADD8E6" style="stroke:#ADD8E6;stroke-width:1;"');
  });

  it('a connector line joins a folder to its children, none with LineThickness 0', () => {
    expect(svg).toContain('style="stroke:#A0A0A0;stroke-width:1;"/>');
    const flat = renderSync(
      '@startfiles\n<style>\nfilesDiagram {\n LineThickness 0\n}\n</style>\nsrc/\n    App.java\n@endfiles',
      OPTIONS,
    );
    expect(flat).not.toContain('<line');
  });
});
