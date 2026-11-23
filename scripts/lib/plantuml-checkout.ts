/**
 * Where the PlantUML Java checkout lives: the oracle fork whose `dot-output` branch builds
 * `oracle/dist/plantuml-oracle.jar`, read for upstream sources, themes and resources. One place,
 * so moving the checkout is a one-line change. Read only: this repository never writes there
 * (CLAUDE.md, "Writing and write-sets").
 *
 * `PLANTUML_FORK` overrides it, as `oracle/build-oracle.sh`, `rebaseline-svg-goldens.ts` and
 * `stock-jar-verify.sh` already read it. The Python and shell scripts that cannot import this
 * module repeat the same default; keep them in step with it.
 */
import { homedir } from 'node:os';
import { join } from 'node:path';

/** The checkout's default location, since 2026-11-22 (it was `~/git/plantuml`). */
export const DEFAULT_PLANTUML_CHECKOUT = join(homedir(), 'git', 'knowvah', 'plantuml');

/** The checkout the scripts read: `PLANTUML_FORK`, else {@link DEFAULT_PLANTUML_CHECKOUT}. */
export const PLANTUML_CHECKOUT = process.env.PLANTUML_FORK ?? DEFAULT_PLANTUML_CHECKOUT;
