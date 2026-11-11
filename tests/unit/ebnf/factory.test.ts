/**
 * `PSystemEbnfFactory` and its commands: what each line does to the diagram, and which lines the jar refuses.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/PSystemEbnfFactory.java
 */
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { CommandEBnfSingleLine } from '../../../src/diagrams/ebnf/CommandEBnfSingleLine.js';
import { CommandCommentMultilines } from '../../../src/diagrams/ebnf/CommandCommentMultilines.js';
import { CommandCommentMultilines2 } from '../../../src/diagrams/ebnf/CommandCommentMultilines2.js';
import { CommandNoteMultilines } from '../../../src/diagrams/ebnf/CommandNoteMultilines.js';
import { EbnfExpression } from '../../../src/diagrams/ebnf/EbnfExpression.js';
import type { PSystemEbnf } from '../../../src/diagrams/ebnf/PSystemEbnf.js';
import { initCommandsList, parseEbnf } from '../../../src/diagrams/ebnf/PSystemEbnfFactory.js';
import { UBrexCommandComment } from '../../../src/diagrams/ebnf/UBrexCommandComment.js';
import { UBrexCommandEbnfMultilines } from '../../../src/diagrams/ebnf/UBrexCommandEbnfMultilines.js';
import { sourceOf } from '../../helpers/utility-single-line.js';
import { body, newGraphic } from './helpers.js';

const EBNF_CACHE = 'test-results/dot-cache/ebnf';
const PROBES = 'plans/ebnf-engine-port/probes';

function parse(...lines: string[]): PSystemEbnf | ParseRefusal {
  // `'ebnf'` joins `block-extractor.ts#DiagramType` at T4a.
  return parseEbnf({ lines, type: 'ebnf' } as unknown as UmlSource, new PreprocessingArtifact());
}

function parsed(...lines: string[]): PSystemEbnf {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${String(result.line)}: ${result.message}`);
  return result;
}

/** A file through the real block builder and preprocessor (`<style>`, `skinparam` and `!option` lifted out). */
function parseFile(path: string): PSystemEbnf | ParseRefusal {
  const source = sourceOf(readFileSync(path, 'utf8'));
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of source.styleSource?.options ?? []) artifact.getOption().define(key, value);
  return parseEbnf(source, artifact);
}

function parsedFile(path: string): PSystemEbnf {
  const result = parseFile(path);
  if ('refused' in result) throw new Error(`refused line ${String(result.line)}: ${result.message}`);
  return result;
}

function kinds(diagram: PSystemEbnf): string[] {
  return diagram.getExpressions().map((e) => (e instanceof EbnfExpression ? 'rule' : 'note'));
}

describe('PSystemEbnfFactory on the corpus (PSystemEbnfFactory.java:55-63)', () => {
  const slugs = readdirSync(EBNF_CACHE).filter((s) => s !== 'ladifa-97-keme950');

  it.each(slugs)('%s parses to a diagram', (slug) => {
    const result = parseFile(`${EBNF_CACHE}/${slug}/in.puml`);
    expect('refused' in result ? `${result.message} @ ${result.line}` : 'diagram').toBe('diagram');
  });

  it('ladifa-97-keme950: `?t? = …` matches no command, refused at line 5 (Syntax Error?, D8)', () => {
    const result = parseFile(`${EBNF_CACHE}/ladifa-97-keme950/in.puml`) as ParseRefusal;
    expect(result.refused).toBe(true);
    expect(result.message).toBe('Syntax Error?');
    // Document line index 4, the jar's 1-based line 5.
    expect(result.line).toBe(4);
  });
});

describe('PSystemEbnfFactory on the planning probes', () => {
  it('cov-no-equals is refused on its rule line, cov-unparsable with Unparsable expression', () => {
    const noEquals = parseFile(`${PROBES}/cov-no-equals.puml`) as ParseRefusal;
    expect([noEquals.kind, noEquals.line, noEquals.message]).toEqual(['syntax', 1, 'Syntax Error?']);
    const unparsable = parseFile(`${PROBES}/cov-unparsable.puml`) as ParseRefusal;
    expect([unparsable.kind, unparsable.line, unparsable.message]).toEqual(['execution', 1, 'Unparsable expression']);
  });

  it('cov-comment-standalone holds three notes then the rule, in source order (the oracle draws three notes)', () => {
    expect(kinds(parsedFile(`${PROBES}/cov-comment-standalone.puml`))).toEqual(['note', 'note', 'note', 'rule']);
  });

  it('cov-multiline-rule reaches addBlocLines as one block, cov-compact defines the pragma', () => {
    expect(kinds(parsedFile(`${PROBES}/cov-multiline-rule.puml`))).toEqual(['rule']);
    const compact = parsedFile(`${PROBES}/cov-compact.puml`);
    expect(kinds(compact)).toEqual(['rule']);
    expect(compact.getPragma().isDefine('COMPACT')).toBe(true);
  });

  it('an empty diagram draws Syntax error!', () => {
    const ug = newGraphic();
    parsed().getTextBlock().drawU(ug);
    expect(body(ug)).toContain('>Syntax error!</text>');
    expect(parsed().getDescription()).toBe('(EBNF)');
  });

  it('registers the five EBNF commands after the common ones, without CommandNoteMultilines', () => {
    expect(initCommandsList().map((c) => c.name)).toEqual([
      'CommonCommands.addCommonCommands1',
      'UBrexCommandComment',
      'CommandCommentMultilines2',
      'CommandCommentMultilines',
      'CommandEBnfSingleLine',
      'UBrexCommandEbnfMultilines',
    ]);
  });

  it('title, scale and an unknown line', () => {
    const diagram = parsed('title T', 'scale 2', 'a = "b";');
    expect(diagram.scale).toBeDefined();
    const refused = parse('a = "b";', 'what is this') as ParseRefusal;
    expect([refused.line, refused.message]).toEqual([1, 'Syntax Error?']);
  });
});

describe('the EBNF commands', () => {
  const at = (s: string): StringLocated => new StringLocated(s, undefined);

  it('CommandEBnfSingleLine captures the comments beside the id', () => {
    const cmd = new CommandEBnfSingleLine();
    expect(cmd.isValid(at('(* up *) rule (* down *) = "a";'))).toBe(CommandControl.OK);
    expect(cmd.isValid(at('?t? = "a";'))).toBe(CommandControl.NOT_OK);
    expect(cmd.explain(at('(* up *) rule (* down *) = "a";'))).toBe(
      "Declaring the EBNF rule 'rule' with a comment above with a comment below",
    );
    const diagram = parsed();
    cmd.execute(diagram, at('rule = "a";'), ParserPass.ONE);
    expect(diagram.getExpressions()).toHaveLength(1);
  });

  it('UBrexCommandComment adds a trimmed note', () => {
    const cmd = new UBrexCommandComment();
    expect(cmd.isValid(at('  (* hello *)  '))).toBe(CommandControl.OK);
    expect(cmd.explain(at('(* hello *)'))).toBe('Adding an EBNF comment "hello"');
  });

  it('the comment multilines strip their delimiters', () => {
    expect(new CommandCommentMultilines().explain(BlocLines.fromArray(['(* a', 'b *)']))).toBe(
      'Adding an EBNF comment with 2 lines of text',
    );
    expect(new CommandCommentMultilines2().explain(BlocLines.fromArray(['(** a', 'b **)']))).toBe(
      'Adding an EBNF documentation comment with 2 lines of text',
    );
    expect(new UBrexCommandEbnfMultilines().explain(BlocLines.fromArray(['r =', '"a";']))).toBe(
      'Declaring an EBNF rule with 2 lines',
    );
  });

  it('CommandNoteMultilines (unregistered, D4) adds a note with its colour', () => {
    const cmd = new CommandNoteMultilines();
    const lines = BlocLines.fromArray(['note #pink', '  hello', 'end note']);
    expect(cmd.isValid(lines)).toBe(CommandControl.OK);
    expect(cmd.explain(lines)).toBe('Adding a note with 1 lines of text with background color #pink');
    expect(cmd.explain(BlocLines.fromArray(['nope']))).toBe('Adding a note');
    const diagram = parsed();
    expect(cmd.execute(diagram, lines, ParserPass.ONE).isOk()).toBe(true);
    expect(kinds(diagram)).toEqual(['note']);
  });
});
