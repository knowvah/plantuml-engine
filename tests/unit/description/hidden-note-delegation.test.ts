/**
 * hnh T2b (#204): the description hidden and removed sets give a note with exactly one link to a non-note its host's
 * flag (`CucaDiagram#isHidden`/`#isRemoved`, `net/atmp/CucaDiagram.java:778-812`, `isNoteWithSingleLinkAttachedTo`
 * `:835-853`). A `-[hidden]-` link is `Link.hidden` (`WithLinkType.java:100-101`), not an invisible `LinkType`, so it
 * counts. Each expectation is the jar's (`tests/fixtures/hidden-note-host/`).
 */
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { DescriptionDiagramAST } from '../../../src/diagrams/description/ast.js';
import {
  effectiveHiddenIds,
  effectiveRemovedIds,
  isNoteWithSingleLinkAttachedTo,
} from '../../../src/diagrams/description/element-grammar.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import { descriptionAst } from './parse-description-ast.js';

function parse(lines: readonly string[]): DescriptionDiagramAST {
  const block: UmlSource = { lines: [...lines], type: 'description' };
  return descriptionAst(parseDescription(block));
}

function hidden(ast: DescriptionDiagramAST): string[] {
  return [...effectiveHiddenIds(ast.nodes, ast.hideShowRules ?? [], ast.links)].sort();
}

function removed(ast: DescriptionDiagramAST): string[] {
  return [...effectiveRemovedIds(ast.nodes, ast.links, ast.removeUnlinked === true)].sort();
}

function noteId(ast: DescriptionDiagramAST): string {
  return ast.nodes.find((n) => n.symbol === 'note')!.id;
}

describe('hnh T2b: isNoteWithSingleLinkAttachedTo', () => {
  it('returns the host of a single-link note, and undefined for a non-note or a two-link note', () => {
    const one = parse(['component A', 'component B', 'A --> B', 'note right of B : a note']);
    expect(isNoteWithSingleLinkAttachedTo(noteId(one), one.nodes, one.links)).toBe('B');
    expect(isNoteWithSingleLinkAttachedTo('B', one.nodes, one.links)).toBeUndefined();
    const two = parse(['component A', 'component B', 'note "n" as N', 'N .. A', 'N -[hidden]- B']);
    expect(isNoteWithSingleLinkAttachedTo('N', two.nodes, two.links)).toBeUndefined();
  });
});

describe('hnh T2b: the hidden set', () => {
  it('note right of B + hide B: B and its note', () => {
    const ast = parse(['component A', 'component B', 'A --> B', 'note right of B : a note', 'hide B']);
    expect(hidden(ast)).toEqual(['B', noteId(ast)].sort());
  });

  it('hide N on a note whose single link goes to visible B: nothing', () => {
    const ast = parse(['component A', 'component B', 'A --> B', 'note "named" as N', 'N .. B', 'hide N']);
    expect(hidden(ast)).toEqual([]);
  });

  it('hide N on a lone note: N', () => {
    const ast = parse(['component A', 'note "alone" as N', 'hide N']);
    expect(hidden(ast)).toEqual(['N']);
  });

  it('show N does not override the hidden host the note takes its flag from', () => {
    const ast = parse(['component A', 'component B', 'A --> B', 'note "named" as N', 'N .. B', 'hide B', 'show N']);
    expect(hidden(ast)).toEqual(['B', 'N']);
  });
});

describe('hnh T2b: the removed set', () => {
  it('a -[hidden]- link counts: N keeps two links and stays when A goes', () => {
    const ast = parse(['component A', 'component B', 'note "n" as N', 'N -[hidden]- B', 'N .. A', 'remove A']);
    expect(removed(ast)).toEqual(['A']);
  });

  it('remove N on a note whose single link goes to visible B: nothing', () => {
    const ast = parse(['component A', 'component B', 'A --> B', 'note "named" as N', 'N .. B', 'remove N']);
    expect(removed(ast)).toEqual([]);
  });

  it('remove @unlinked keeps two components joined only by a -[hidden]- link', () => {
    const ast = parse(['component A', 'component B', 'component C', 'A -[hidden]- B', 'remove @unlinked']);
    expect(removed(ast)).toEqual(['C']);
  });
});
