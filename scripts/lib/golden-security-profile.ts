/**
 * The security profile a corpus fixture's oracle is captured under -- shared
 * by the routing/refusal gates (which must RENDER a fixture with it,
 * `tests/oracle/svg-conformance/corpus-gate-part.ts`) and the recapture tool
 * (which must CAPTURE it with it, `scripts/lib/recapture-render.ts`). One
 * definition, so a capture and its gate can never disagree.
 */
import { SecurityProfile } from '../../src/core/security/SecurityProfile.js';

/** A fixture's corpus key: its tree (`goldens`, `dot-cache`) and type (`svg-dot`, `class`, ...). */
export interface CorpusKey {
  readonly tree: string;
  readonly type: string;
}

/**
 * The security profile a fixture's golden was captured under, which is the
 * profile both gates must render it with. `oracle/goldens/svg-dot/` holds the
 * jar's `PLANTUML_SECURITY_PROFILE=INSECURE` renders (its README): under the
 * default LEGACY profile `PSystemDot#exportDiagramNow` writes a fixed
 * suppression page instead of graphviz's SVG (`PSystemDot.java:77-84`,
 * `SecurityProfile.java:195-202`). Every other tree is a LEGACY capture.
 */
export function securityProfileOf(f: CorpusKey): SecurityProfile | undefined {
  return f.tree === 'goldens' && f.type === 'svg-dot' ? SecurityProfile.INSECURE : undefined;
}
