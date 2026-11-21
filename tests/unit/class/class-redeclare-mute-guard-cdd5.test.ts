/**
 * cdd5-T4b (class-redeclare-mute-guard-missing): re-declaring an existing
 * entity with a different TYPE goes through `Entity#muteToType`, which only
 * mutes inside `CLASS_LIKE_TYPES` (to that set plus OBJECT). Since upstream
 * `592901f0c42` (#3006) the set also holds PROTOCOL/STRUCT/EXCEPTION/
 * METACLASS/STEREOTYPE/ENTITY, so `petiku-70-fogu777` (CLASS -> STRUCT) now
 * renders; tests/unit/class/class-like-types-2668.test.ts covers that. Anything
 * outside the set (e.g. OBJECT -> CLASS) is still an execution error: "Bad
 * name" from the single-line command, "Cannot create X because it already
 * exists" from the multi-line one.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/Entity.java:208-232
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/classdiagram/command/CommandCreateClass.java:195-197
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/classdiagram/command/CommandCreateClassMultilines.java:245-246
 */
import { describe, it, expect } from 'vitest';
import { parseClass as parseClassRaw } from '../../../src/diagrams/class/parser.js';
import { parseRefusalOf } from '../../../src/core/dispatcher.js';
import { parseClass } from './parse-helper.js';

function refusal(...lines: string[]) {
  return parseRefusalOf(parseClassRaw({ lines, type: 'class', linePositions: lines.map((_, i) => i) }));
}

function kindOf(id: string, ...lines: string[]) {
  return parseClass({ lines, type: 'class' }).classifiers.find((c) => c.id === id)?.kind;
}

describe('classifier redeclaration: muteToType guard', () => {
  it('refuses OBJECT -> CLASS from the multi-line command', () => {
    // cdd5-T5e: attributed to the block's CLOSING `}` (index 2), not the
    // opener (index 1) -- PSystemError#getLineLocation's getLastLine()
    // (error/PSystemError.java:102-104). Jar: "Error line 4" on
    // `@startuml / object bar / class bar { / } / @enduml`.
    const r = refusal('object bar', 'class bar {', '}');
    expect(r).toMatchObject({ kind: 'execution', line: 2, message: 'Cannot create bar because it already exists' });
  });

  it('refuses OBJECT -> CLASS from the single-line command with "Bad name"', () => {
    // tests/fixtures/class-2668/object-to-class.svg (jar: "Error line 3").
    expect(refusal('object bar', 'class bar')).toMatchObject({ kind: 'execution', line: 1, message: 'Bad name' });
  });

  it('refuses a mute FROM a type outside the mutable set (OBJECT -> CLASS)', () => {
    expect(refusal('object bar', 'class bar {}')?.message).toBe('Bad name');
  });

  it('mutes freely inside the set: CLASS -> INTERFACE -> ENUM -> ABSTRACT', () => {
    expect(kindOf('bar', 'foo <-- bar', 'interface bar', 'enum bar {', '}', 'abstract class bar')).toBe('abstract');
  });

  it('a same-type redeclaration of a non-mutable type is accepted', () => {
    expect(kindOf('bar', 'struct bar', 'struct bar {', '}')).toBe('struct');
  });

  it('cdd5-T5e: discards every interior body line, attributing to the closer', () => {
    const r = refusal('object bar', 'class bar {', '+ int x', '+ int y', '}');
    expect(r).toMatchObject({ kind: 'execution', line: 4, message: 'Cannot create bar because it already exists' });
  });

  it('cdd5-T5e: the deferred refusal fires even with a blank interior line', () => {
    const r = refusal('object bar', 'class bar {', '', '}');
    expect(r).toMatchObject({ kind: 'execution', line: 3, message: 'Cannot create bar because it already exists' });
  });
});
