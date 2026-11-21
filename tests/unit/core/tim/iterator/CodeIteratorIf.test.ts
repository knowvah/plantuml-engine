import { describe, expect, it } from 'vitest';
import { line, runBody } from '../../../../helpers/tim-iterator-context.js';
import { EaterException } from '../../../../../src/core/tim/EaterException.js';

describe('CodeIteratorIf orphan directives (SI6: an error, as upstream has it)', () => {
  // SI5a shipped these three as NO-OPS, because a faithful throw had nowhere to
  // land: `renderSync` would have propagated it to the caller. SI6 built the
  // error-diagram path (`src/core/error/`), so the throw is now what the jar
  // does -- render `No if related to this <directive>` -- and the divergence is
  // retired. Live-oracle verified against `oracle/dist/plantuml-oracle.jar`.
  it('!endif with no matching !if throws No if related to this endif', () => {
    expect(() => runBody([line('!endif', 'ENDIF')])).toThrow('No if related to this endif');
  });

  it('!else with no matching !if throws No if related to this else', () => {
    expect(() => runBody([line('!else', 'ELSE')])).toThrow('No if related to this else');
  });

  it('!elseif with no matching !if throws No if related to this elseif', () => {
    expect(() => runBody([line('!elseif 1', 'ELSEIF')])).toThrow('No if related to this elseif');
  });

  it('the throw is an EaterException, so it carries the offending line', () => {
    expect(() => runBody([line('!endif', 'ENDIF')])).toThrow(EaterException);
  });
});

describe('CodeIteratorIf — an !if left open at the end of the body (CodeIteratorIf.java:75-80)', () => {
  // Since upstream 0537b558644 the iterator keeps its own stack of the !if/!ifdef/!ifndef lines it opened
  // and throws at the end of the body for the last one still open; the old jar tolerated it. The jar's
  // render of pdiff buveco-86-tibo673 (forum.plantuml.net/6808) is now the `!ifdef without !endif` page.
  it('a TRUE unclosed !ifdef throws !ifdef without !endif on that line', () => {
    const open = line('!ifdef FOO', 'IFDEF');
    expect(() => runBody([line('!define FOO', 'AFFECTATION_DEFINE'), open, line('!$x = 1', 'AFFECTATION')])).toThrow(
      '!ifdef without !endif',
    );
  });

  it('a FALSE unclosed !ifndef throws too, naming its keyword', () => {
    expect(() => runBody([line('!ifndef NEVER', 'IFNDEF'), line('!$x = 1', 'AFFECTATION')])).toThrow(
      '!ifndef without !endif',
    );
  });

  it('reports the innermost line left open; a closed nested !if does not count', () => {
    const body = [
      line('!if 1', 'IF'),
      line('!ifdef A', 'IFDEF'),
      line('!endif', 'ENDIF'),
      line('!$x = 1', 'AFFECTATION'),
    ];
    expect(() => runBody(body)).toThrow('!if without !endif');
  });

  it('a balanced body does not throw', () => {
    const { memory } = runBody([
      line('!ifdef NEVER', 'IFDEF'),
      line('!endif', 'ENDIF'),
      line('!$x = 1', 'AFFECTATION'),
    ]);
    expect(memory.getVariable('$x')?.toString()).toBe('1');
  });
});

describe('CodeIteratorIf', () => {
  it('a false !if suppresses everything up to !endif, including a nested !if', () => {
    const { memory } = runBody([
      line('!if 0', 'IF'),
      line('!if 1', 'IF'),
      line('!$x = 1', 'AFFECTATION'),
      line('!endif', 'ENDIF'),
      line('!endif', 'ENDIF'),
    ]);
    expect(memory.getVariable('$x')).toBeUndefined();
  });

  it('!else only fires when no prior branch was taken', () => {
    const { memory } = runBody([
      line('!if 1', 'IF'),
      line('!$x = "if"', 'AFFECTATION'),
      line('!else', 'ELSE'),
      line('!$x = "else"', 'AFFECTATION'),
      line('!endif', 'ENDIF'),
    ]);
    expect(memory.getVariable('$x')?.toString()).toBe('if');
  });

  it('!else fires when the !if was false', () => {
    const { memory } = runBody([
      line('!if 0', 'IF'),
      line('!$x = "if"', 'AFFECTATION'),
      line('!else', 'ELSE'),
      line('!$x = "else"', 'AFFECTATION'),
      line('!endif', 'ENDIF'),
    ]);
    expect(memory.getVariable('$x')?.toString()).toBe('else');
  });
});

describe('CodeIteratorIf via EaterIfdef/EaterIfndef directives', () => {
  it('!ifdef true branch runs when the variable is set', () => {
    const { memory } = runBody([
      line('!$existing = 1', 'AFFECTATION'),
      line('!ifdef $existing', 'IFDEF'),
      line('!$hit = 1', 'AFFECTATION'),
      line('!endif', 'ENDIF'),
    ]);
    expect(memory.getVariable('$hit')?.toInt()).toBe(1);
  });

  it('!ifndef true branch runs when the variable is unset', () => {
    const { memory } = runBody([
      line('!ifndef nope', 'IFNDEF'),
      line('!$hit = 1', 'AFFECTATION'),
      line('!endif', 'ENDIF'),
    ]);
    expect(memory.getVariable('$hit')?.toInt()).toBe(1);
  });
});
