/**
 * `%version()` -- the version string, read through the injected
 * {@link TimEnvironment}. Upstream returns `Version.versionString()`
 * (`GetVersion.java:63-66`), i.e. `CompilationInfo.VERSION`
 * (`Version.java:47-49`), which the dev-build oracle jar prints as
 * `$version$`. The default environment answers this port's own
 * `versionString()` (`src/core/version.ts`) by maintainer ruling #155
 * (2026-11-09) -- a signed divergence (DIVERGENCES.md, "`%version()` prints
 * this port's version").
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/builtin/GetVersion.java
 */

import { TValue } from '../expression/TValue.js';
import { TFunctionSignature } from '../TFunctionSignature.js';
import { SimpleReturnFunction } from './SimpleReturnFunction.js';
import type { TimEnvironment } from './TimEnvironment.js';

const SIGNATURE = new TFunctionSignature('%version', 0);

export class GetVersion extends SimpleReturnFunction {
  constructor(private readonly env: TimEnvironment) {
    super();
  }

  getSignature(): TFunctionSignature {
    return SIGNATURE;
  }

  canCover(nbArg: number, _namedArguments: ReadonlySet<string>): boolean {
    return nbArg === 0;
  }

  executeReturnFunction(
    _context: unknown,
    _memory: unknown,
    _location: unknown,
    _values: readonly TValue[],
    _named: ReadonlyMap<string, TValue>,
  ): TValue {
    return TValue.fromString(this.env.getVersionString());
  }
}
