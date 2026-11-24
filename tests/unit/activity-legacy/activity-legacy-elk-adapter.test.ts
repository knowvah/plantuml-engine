/**
 * lae T2a/T2b (#158): `ActivityLegacyElkAdapter` answers the ELK maker's reads from the legacy abel model. Sizes are
 * the jar's: `tests/fixtures/activity-legacy/pragma-elk-if.svg` draws `A` as a 28.025x32 rect and `c?` with
 * `textLength="11.619"` at font-size 11.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { ColorType } from '../../../src/core/abel/ColorType.js';
import { GroupType } from '../../../src/core/abel/GroupType.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { USymbols } from '../../../src/core/decoration/symbol/USymbols.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { ActivityLegacyElkAdapter } from '../../../src/diagrams/activity-legacy/activity-legacy-elk-adapter.js';
import { MEASURER, parseThroughPreprocessor } from '../../helpers/legacy-activity-dot.js';

const FIXTURES = join(import.meta.dirname, '../../fixtures/activity-legacy');
const SB = new MeasurerStringBounder(MEASURER);

function diagramOf(slug: string): ActivityDiagram {
  return parseThroughPreprocessor(readFileSync(join(FIXTURES, `${slug}.puml`), 'utf8'));
}

function adapterOf(slug: string): { diagram: ActivityDiagram; adapter: ActivityLegacyElkAdapter } {
  const diagram = diagramOf(slug);
  return { diagram, adapter: new ActivityLegacyElkAdapter(diagram, SB) };
}

function nameOf(diagram: ActivityDiagram, id: string): string {
  return [...diagram.leafs(), ...diagram.groups()].find((e) => e.getUid() === id)!.getName();
}

describe('ActivityLegacyElkAdapter: leaves and links (pragma-elk-if)', () => {
  it('lists the leaves in creation order, every one in the root group', () => {
    const { diagram, adapter } = adapterOf('pragma-elk-if');

    expect(adapter.leafs().map((id) => nameOf(diagram, id))).toEqual(['start', 'A', '#4', 'B', 'C', 'end']);
    expect(adapter.leafs().map((id) => adapter.getParentContainer(id))).toEqual(['', '', '', '', '', '']);
    expect(adapter.getChildrenGroups(adapter.getRootGroup())).toEqual([]);
  });

  it('names each link by its index, with the endpoints the source wrote', () => {
    const { diagram, adapter } = adapterOf('pragma-elk-if');
    const ends = adapter
      .getLinks()
      .map((l) => `${nameOf(diagram, adapter.getEntity1(l))}->${nameOf(diagram, adapter.getEntity2(l))}`);

    expect(adapter.getLinks()).toEqual(['link0', 'link1', 'link2', 'link3', 'link4']);
    expect(ends).toEqual(['start->A', 'A->#4', '#4->B', '#4->C', 'B->end']);
    expect(adapter.isInvis('link0')).toBe(false);
  });

  it("sizes the start circle 20x20 and A as the jar's 28.025x32 rect", () => {
    const { adapter } = adapterOf('pragma-elk-if');
    const [start, a] = adapter.leafs();

    const startDim = adapter.calculateDimension(start!, SB);
    const aDim = adapter.calculateDimension(a!, SB);
    expect([startDim.getWidth(), startDim.getHeight()]).toEqual([20, 20]);
    expect(aDim.getWidth()).toBeCloseTo(28.025, 3);
    expect(aDim.getHeight()).toBe(32);
  });

  it('answers an unlabelled link with the 0x0 empty block, never undefined', () => {
    const { adapter } = adapterOf('pragma-elk-if');
    const dim = adapter.getLabel('link0', SB).calculateDimension(SB);

    expect([dim.getWidth(), dim.getHeight()]).toEqual([0, 0]);
  });

  it('draws the if condition c? as quantifier 2 in the ARROW skin font (11 in an activity diagram)', () => {
    const { adapter } = adapterOf('pragma-elk-if');
    const dim = adapter.getQuantifier('link1', 2, SB)!.calculateDimension(SB);

    expect(adapter.getQuantifier2('link1')).toBe('c?');
    expect(adapter.getQuantifier('link1', 1, SB)).toBeNull();
    expect(adapter.getQuantifier('link0', 2, SB)).toBeNull();
    expect(dim.getWidth()).toBeCloseTo(11.619, 3);
    expect(dim.getHeight()).toBe(11);
  });

  it("styles the edge with the activity diagram's arrow style", () => {
    const { adapter } = adapterOf('pragma-elk-if');

    expect(adapter.getArrowStyle('link0').lineColor).toBe('#181818');
    expect(adapter.getArrowStyle('link0').stroke?.getThickness()).toBe(1);
    expect(adapter.getArrowThickness()).toBeNull();
    expect(adapter.getLinkColors('link0')!.getColor(ColorType.ARROW)).toBeNull();
    expect(adapter.getSpecificColor('link0')).toBeNull();
    expect(adapter.getRoleLabel('link0', 1, SB)).toBeNull();
  });
});

describe('ActivityLegacyElkAdapter: labels', () => {
  it('a labelled link is the label block plus marginLabel 1, twice (addVisibilityModifier, then :233-234)', () => {
    const { adapter } = adapterOf('elk-lap-arrow-label');
    const label = adapter.getLabel('link1', SB).calculateDimension(SB);

    // `[go on]` at the arrow style's font-size 11: the jar's `textLength="27.5"`, line height 11.
    expect(label.getWidth()).toBeCloseTo(27.5 + 4, 3);
    expect(label.getHeight()).toBe(11 + 4);
  });

  it('a note on link with no label is the EntityImageNoteLink block alone (mergeTB with EMPTY_TEXT_BLOCK)', () => {
    const { adapter } = adapterOf('elk-lap-note-on-link');
    const dim = adapter.getLabel('link1', SB).calculateDimension(SB);
    const unnoted = adapter.getLabel('link2', SB).calculateDimension(SB);

    // `multi line`: the jar's `textLength="51.35"` plus the note's 31 of horizontal padding; one 13pt line plus 20.
    expect(dim.getWidth()).toBeCloseTo(51.35 + 31, 3);
    expect(dim.getHeight()).toBe(33);
    expect([unnoted.getWidth(), unnoted.getHeight()]).toEqual([0, 0]);
  });
});

describe('ActivityLegacyElkAdapter: a note on link merges on its side', () => {
  function labelDim(position: string): [number, number] {
    const source = ['@startuml', '(*) --> [go on] A', `note ${position} on link: hi`, '@enduml'].join('\n');
    const adapter = new ActivityLegacyElkAdapter(parseThroughPreprocessor(source), SB);
    const dim = adapter.getLabel('link0', SB).calculateDimension(SB);
    return [dim.getWidth(), dim.getHeight()];
  }

  it('left and right merge side by side, top and bottom stacked: the label keeps one margin (29.5x13)', () => {
    // Stacked, the wider note sets the width: the note `hi` alone (41.156 = its text plus 31 of padding) by 33.
    const [noteWidth, stackedHeight] = labelDim('bottom');
    expect(noteWidth).toBeCloseTo(41.156, 3);
    expect(stackedHeight).toBe(13 + 33);
    expect(labelDim('top')).toEqual([noteWidth, stackedHeight]);
    for (const side of ['left', 'right']) {
      const [w, h] = labelDim(side);
      expect(w).toBeCloseTo(29.5 + noteWidth, 3);
      expect(h).toBe(33);
    }
  });
});

describe('ActivityLegacyElkAdapter: groups (T2b)', () => {
  it('elk-lap-partition: two PACKAGE groups under the root, each listing its leaves in creation order', () => {
    const { diagram, adapter } = adapterOf('elk-lap-partition');
    const groups = adapter.getChildrenGroups('');

    expect(groups.map((g) => nameOf(diagram, g))).toEqual(['Conductor', 'Audience']);
    expect(groups.map((g) => adapter.getGroupType(g))).toEqual([GroupType.PACKAGE, GroupType.PACKAGE]);
    expect(groups.map((g) => adapter.isEmpty(g))).toEqual([false, false]);
    expect(adapter.groupLeafs(groups[0]!).map((id) => nameOf(diagram, id))).toEqual([
      'start',
      'Climbs on Platform',
      'S1',
      'Bows',
    ]);
    expect(adapter.groupLeafs(groups[1]!).map((id) => nameOf(diagram, id))).toEqual(['Applauds']);
    expect(adapter.getParentContainer(adapter.groupLeafs(groups[1]!)[0]!)).toBe(groups[1]);
    expect(adapter.getParentContainer(groups[0]!)).toBe('');
  });

  it("elk-lap-partition: Conductor's header is 14 high (the jar's 14pt bold title), its style the partition's", () => {
    const { adapter } = adapterOf('elk-lap-partition');
    const [conductor, audience] = adapter.getChildrenGroups('');
    const style = adapter.getClusterStyle(conductor!);

    expect(adapter.getClusterHeader(conductor!, SB).getTitleAndAttributeHeight()).toBe(14);
    // The jar's folder: `stroke:#000;stroke-width:1.5`, `fill="none"`.
    expect(style.lineColor).toBe('#000000');
    expect(style.stroke.getThickness()).toBe(1.5);
    expect([style.shadowing, style.roundCorner]).toEqual([0, 0]);
    // `#LightSkyBlue` is not read under ELK (MyElkCluster.java:99-102): the style's transparent back.
    expect(adapter.getClusterBackColor(audience!)).toBe('#00000000');
    expect(adapter.getEntityColors(audience!).getColor(ColorType.BACK)).toBe('#87CEFA');
    expect([adapter.getUSymbol(conductor!), adapter.getPackageStyle(conductor!)]).toEqual([null, null]);
  });

  it('reads packageStyle, the title and stereotype alignments from the skin parameters', () => {
    const { adapter } = adapterOf('elk-lap-partition');

    expect(adapter.packageStyle()).toBe('FOLDER');
    expect(adapter.getPackageTitleAlignment()).toBe(HorizontalAlignment.CENTER);
    expect(adapter.getStereotypeAlignment()).toBe(HorizontalAlignment.CENTER);

    const source = [
      '@startuml',
      'skinparam packageStyle rectangle',
      'skinparam packageTitleAlignment right',
      'skinparam stereotypeAlignment left',
      'partition P {',
      '(*) --> A',
      '}',
      '@enduml',
    ].join('\n');
    const styled = new ActivityLegacyElkAdapter(parseThroughPreprocessor(source), SB);
    expect(styled.packageStyle()).toBe('RECTANGLE');
    expect(styled.getPackageTitleAlignment()).toBe(HorizontalAlignment.RIGHT);
    expect(styled.getStereotypeAlignment()).toBe(HorizontalAlignment.LEFT);
  });

  it('the magnetic-border style signs classDiagram and the FOLDER symbol', () => {
    const { adapter } = adapterOf('elk-lap-partition');
    const [conductor] = adapter.getChildrenGroups('');
    const style = adapter.getClusterStyleForMagneticBorder(conductor!, USymbols.FOLDER);

    expect(style.stroke.getThickness()).toBe(1.5);
    expect(style.lineColor).toBe('#000000');
  });

  it('elk-partition-empty: P is empty, and once muted it is a leaf the svek empty partition sizes', () => {
    const { diagram, adapter } = adapterOf('elk-partition-empty');
    const [p] = adapter.getChildrenGroups('');

    expect(adapter.isEmpty(p!)).toBe(true);
    expect(adapter.leafs().map((id) => nameOf(diagram, id))).toEqual(['start', 'A', 'end']);
    adapter.muteToType(p!, LeafType.EMPTY_PACKAGE);
    const dim = adapter.calculateDimension(p!, SB);
    expect(dim.getWidth()).toBeCloseTo(29.3625, 3);
    expect(dim.getHeight()).toBe(48);
    // CucaDiagram#leafs() now lists it, so getUnpackagedEntities prints it a second time (CucaDiagram.java:894-904).
    expect(adapter.leafs().map((id) => nameOf(diagram, id))).toEqual(['P', 'start', 'A', 'end']);
  });

  it('elk-lap-inner-brace: the inner activity is an INNER_ACTIVITY group holding A and B, never simplified', () => {
    const { diagram, adapter } = adapterOf('elk-lap-inner-brace');
    const [inner] = adapter.getChildrenGroups('');

    expect(adapter.getGroupType(inner!)).toBe(GroupType.INNER_ACTIVITY);
    expect(adapter.groupLeafs(inner!).map((id) => nameOf(diagram, id))).toEqual(['A', 'B']);
    // The simplifier would have overridden it into an ACTIVITY leaf (`Entity#overrideImage`): it is still a group.
    expect(adapter.leafs().map((id) => nameOf(diagram, id))).toEqual(['start', 'A', 'B', 'end']);
    expect(diagram.leafs().every((leaf) => leaf.getSvekImage() === undefined)).toBe(true);
    // Its `##2` display draws the jar's `1.` `2` title, 14 high; INNER_ACTIVITY reads the plain group style.
    expect(adapter.getClusterHeader(inner!, SB).getTitleAndAttributeHeight()).toBe(14);
    expect(adapter.getClusterStyle(inner!).stroke.getThickness()).toBe(1);
  });
});
