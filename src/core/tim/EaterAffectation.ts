/**
 * `!$var = <expr>` (and `!local`/`!global $var = <expr>`, `!$var ?= <expr>`
 * conditional assignment).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/EaterAffectation.java
 */

import { isLegacyAffectation } from '../text/PythonLine.js';
import { Eater } from './Eater.js';
import type { StringLocated } from './StringLocated.js';
import type { TContext } from './TFunction.js';
import type { TMemory } from './TMemory.js';
import { lazzyParse } from './TVariableScope.js';

/**
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/EaterAffectation.java
 */
export class EaterAffectation extends Eater {
  constructor(sl: StringLocated) {
    super(sl.getTrimmed());
  }

  /** @throws EaterException (thrown, not returned) on a malformed directive. */
  analyze(context: TContext, memory: TMemory): void {
    this.skipSpaces();
    this.checkAndEatChar('!');
    this.skipSpaces();
    let varname = this.eatAndGetVarname();
    let scope = lazzyParse(varname);
    if (scope !== undefined) {
      this.skipSpaces();
      if (this.peekChar() === '?' || this.peekChar() === '=') {
        // The variable itself is "local" or "global", which is not a good
        // idea by the way
        scope = undefined;
      } else {
        varname = this.eatAndGetVarname();
      }
    }
    // Upstream routes only `PythonLine.isLegacyAffectation` lines here (TLineType.java:179); the others
    // (`!x = 1`) are Python statements and never warn. Until the Python preprocessor is ported they still
    // run here, as before 0537b558644, so the warning keeps to the lines the jar warns on.
    if (isLegacyAffectation(this.getStringLocated().getString())) this.checkVariableStartsWithDollar(context, varname);
    this.skipSpaces();
    let conditional = false;
    if (this.peekChar() === '?') {
      this.checkAndEatChar('?');
      conditional = true;
    }
    this.checkAndEatChar('=');
    if (conditional && memory.getVariable(varname) !== undefined) return;

    this.skipSpaces();
    const value = this.eatExpression(context, memory);
    memory.putVariable(varname, value, scope, this.getStringLocated());
  }
}
