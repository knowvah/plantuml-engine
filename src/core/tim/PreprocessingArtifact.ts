/**
 * `PreprocessingArtifact` + `ConfigurationStore<OptionKey>` -- the two
 * `net.sourceforge.plantuml.preproc` types `EaterOption` (`!option`) needs.
 * That package is out of this mission's scope; only the members `tim/` calls
 * are ported, per the stand-in discipline documented in `TFunction.ts`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/preproc/PreprocessingArtifact.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/preproc/ConfigurationStore.java
 */

import type { TPreprocessingArtifact, TPreprocessingOptionStore, TWarning } from './TFunction.js';

export class PreprocessingArtifact implements TPreprocessingArtifact {
  private readonly warnings: TWarning[] = [];
  private readonly options = new Map<string, string>();

  /** A `LinkedHashSet<Warning>` upstream (`PreprocessingArtifact.java:53-59`): an equal warning
   *  (`Warning#equals`, same lines) is kept once, at its first position. */
  addWarning(warning: TWarning): void {
    const same = (w: TWarning): boolean =>
      w.message.length === warning.message.length && w.message.every((line, i) => line === warning.message[i]);
    if (!this.warnings.some(same)) this.warnings.push(warning);
  }

  getOption(): TPreprocessingOptionStore {
    return {
      define: (key: string, value: string): void => {
        this.options.set(key, value);
      },
    };
  }

  getWarnings(): readonly TWarning[] {
    return this.warnings;
  }

  getOptions(): ReadonlyMap<string, string> {
    return this.options;
  }
}
