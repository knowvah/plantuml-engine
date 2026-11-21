/**
 * SName — the full `style/SName.java` enum (1.2026.8beta1) plus its
 * `retrieve` lookup.
 */
import { describe, expect, it } from 'vitest';
import { SNAMES, retrieve } from '../../../../src/core/style/SName.js';
import type { SName } from '../../../../src/core/style/StyleSignatureBasic.js';

describe('SName', () => {
  it('carries every SName.java constant: 160 members at a720bdd, SName.java:42-205', () => {
    // `grep -cE '^\s+[A-Za-z_][A-Za-z0-9_]*\s*[,;]' style/SName.java` = 157 at 1.2026.8beta1, plus `digital`
    // (upstream 3cdc46b2092, SName.java:88 at a720bdd), `pie` and `radar` (e8ef39dd55c, SName.java:199-200).
    expect(SNAMES).toHaveLength(160);
    expect(new Set(SNAMES).size).toBe(160);
    expect(SNAMES[0]).toBe('action'); // SName.java:42
    expect(SNAMES.indexOf('digital')).toBe(SNAMES.indexOf('diamond') + 1); // SName.java:87-88
    expect(SNAMES.slice(SNAMES.indexOf('scatter'), SNAMES.indexOf('axis'))).toEqual(['scatter', 'pie', 'radar']);
    expect(SNAMES[159]).toBe('annotation'); // SName.java:205
  });

  it('keeps the trailing-underscore constant names verbatim', () => {
    const underscored = SNAMES.filter((s) => s.endsWith('_'));
    expect(underscored).toEqual(['class_', 'goto_', 'interface_', 'package_', 'private_', 'protected_', 'public_']);
  });

  it('keeps the eight names VisibilityModifier emits assignable via the StyleSignatureBasic re-export', () => {
    const names: readonly SName[] = [
      'root',
      'element',
      'visibilityIcon',
      'IEMandatory',
      'public_',
      'private_',
      'protected_',
      'package_',
    ];
    expect(names.every((n) => SNAMES.includes(n))).toBe(true);
  });

  describe('retrieve (SName.java:205-216)', () => {
    it('keys on name().replace("_", "").toLowerCase(), looked up case-insensitively', () => {
      expect(retrieve('PUBLIC')).toBe('public_');
      expect(retrieve('mindmapDiagram')).toBe('mindmapDiagram');
      expect(retrieve('ROOTNODE')).toBe('rootNode');
    });

    it('does not match the underscored spelling (the key has the underscore removed)', () => {
      expect(retrieve('public_')).toBeUndefined();
    });

    it('returns undefined for an unknown name (Java HashMap#get null)', () => {
      expect(retrieve('noSuchName')).toBeUndefined();
    });
  });
});
