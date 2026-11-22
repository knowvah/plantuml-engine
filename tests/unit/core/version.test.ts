/**
 * Fitness function: `VERSION` is "kept in step with package.json#version"
 * (its own doc comment). It drifted (0.1.0 vs 0.2.0) and the error banner,
 * the about page and the `version` page all printed an untrue version
 * (ufp journal row 36).
 *
 * `DOT_ENGINE_VERSION` is pinned the same way to the installed
 * `@knowvah/dot-engine` and to the tarball `package.json` names (vkt D4): the
 * package exports no version, so a bump that forgets the constant fails here.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DOT_ENGINE_VERSION, VERSION } from '../../../src/core/version.js';

const DOT_ENGINE = '@knowvah/dot-engine';
/** The dependency is a registry tarball URL ending `dot-engine-<v>.tgz`. */
const TARBALL_VERSION = /dot-engine-(\d+\.\d+\.\d+)\.tgz$/;

interface PackageJson {
  version: string;
  dependencies: Record<string, string>;
}

function readPackageJson(relative: string): PackageJson {
  return JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8')) as PackageJson;
}

describe('VERSION', () => {
  it('equals package.json#version', () => {
    expect(VERSION).toBe(readPackageJson('../../../package.json').version);
  });
});

describe('DOT_ENGINE_VERSION', () => {
  it('equals the installed @knowvah/dot-engine version', () => {
    expect(DOT_ENGINE_VERSION).toBe(readPackageJson(`../../../node_modules/${DOT_ENGINE}/package.json`).version);
  });

  it("equals the version of package.json's @knowvah/dot-engine tarball", () => {
    const dependency = readPackageJson('../../../package.json').dependencies[DOT_ENGINE] ?? '';
    expect(TARBALL_VERSION.exec(dependency)?.[1]).toBe(DOT_ENGINE_VERSION);
  });
});
