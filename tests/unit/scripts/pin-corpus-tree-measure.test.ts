// @vitest-environment node
/**
 * `scripts/pin-corpus-tree-measure.ts#measureFixture` must measure a
 * `!pragma layout elk` source the way the gates do (mission
 * oracle-gap-capture, T4b finding): the gates hold one ELK backend per
 * process (routing-conformance.test.ts:258-273, refusal-coverage.test.ts:
 * 287-301), and `renderSync` without one refuses such a source outright
 * (`ELK_RENDER_SYNC_UNSUPPORTED`, src/core/elk/layout-services.ts), which the
 * pin tool would then record as a refusal the gates never see.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { loadElk, type ElkBackend } from '../../../src/index.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { measureFixture } from '../../../scripts/pin-corpus-tree-measure.js';

const ELK_CLASS = '@startuml\n!pragma layout elk\nclass Foo\nclass Bar\nFoo --> Bar\n@enduml\n';
const JAR_CLASS_HEAD = '<svg xmlns="http://www.w3.org/2000/svg" data-diagram-type="CLASS"><text>x</text></svg>';

let tmp: string;
let elk: ElkBackend;

beforeAll(async () => {
  tmp = mkdtempSync(join(tmpdir(), 'ogc-measure-elk-'));
  mkdirSync(join(tmp, 'elk-class'));
  writeFileSync(join(tmp, 'elk-class', 'in.puml'), ELK_CLASS);
  writeFileSync(join(tmp, 'elk-class', 'in.svg'), JAR_CLASS_HEAD);
  elk = await loadElk();
});

afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('measureFixture and ELK', () => {
  it('without a backend, an elk source reads as our refusal (the defect the gates never measure)', () => {
    const m = measureFixture(tmp, 'elk-class', fixtureIncludeStore());
    expect(m.weErrored).toBe(true);
    expect(m.jarType).toBe('CLASS');
  });

  it('with the backend the gates pass, the same source renders CLASS and agrees with the jar', () => {
    const m = measureFixture(tmp, 'elk-class', fixtureIncludeStore(), elk);
    expect(m.weErrored).toBe(false);
    expect(m.ourType).toBe('CLASS');
    expect(m.engine).toBe('class');
  });
});
