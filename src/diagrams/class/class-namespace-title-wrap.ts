/**
 * A class group title's creole atoms -> drawn runs, wrapped at the title style's `MaximumWidth`: upstream
 * 927f7531ddf builds a cluster title with `label.create9(fontConfiguration, alignment, g.getSkinParam(),
 * style.wrapWidth())` (`ClusterHeader.java:129`) and f29aa9bd058 an empty package's with the same call
 * (`EntityImageEmptyPackage.java:118-119`). `Display#create9` -> `SheetBlock1` hands every physical stripe to
 * `Fission#getSplitted`, which decomposes it into per-word atoms once the width is non-zero, even where nothing
 * breaks (`core/klimt/creole/Fission.ts`'s doc comment). Split out of `class-namespace-title-runs.ts` (500-line cap).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/ClusterHeader.java:129
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageEmptyPackage.java:118-119
 */
import type { StringMeasurer } from '../../core/measurer.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import { buildLineAtoms } from '../../core/klimt/creole/legacy/StripeSimple.js';
import type { CreoleAtom } from '../../core/klimt/creole/atom/Atom.js';
import { getSplitted } from '../../core/klimt/creole/Fission.js';
import type { SpriteDimsLookup } from '../../core/creole-atoms.js';
import type { SpriteRegistry } from '../../core/sprite-commands.js';
import { manageGuillemet } from '../../core/text/Guillemet.js';
import { atomFontSpec } from './class-member-creole-sea.js';
import { resolveInlineAtom } from './class-member-atom-resolve.js';
import type { NamespaceTitleRun } from './class-namespace-title-runs.js';

/** The sprite lookups an inline atom resolves through. */
export interface TitleRunAssets {
  readonly sprites: SpriteRegistry | undefined;
  readonly spriteDims: SpriteDimsLookup | undefined;
}

/** `class-namespace-title-runs.ts#namespaceTitleLines`' optional inputs. */
export interface NamespaceTitleLineOptions {
  readonly sprites?: SpriteRegistry | undefined;
  readonly spriteDims?: SpriteDimsLookup | undefined;
  /** `style.wrapWidth().getMaxWidth()` of the title's style (`ClusterHeader.java:129`,
   *  `EntityImageEmptyPackage.java:118-119`); 0/absent = no wrap. */
  readonly wrapWidth?: number | undefined;
}

/** One line of atoms -> its runs (`class-namespace-title-runs.ts#namespaceTitleRuns`); `label` is the fallback text
 *  of a line that resolved to no run. */
export function atomRuns(
  atoms: readonly CreoleAtom[],
  font: FontConfiguration,
  label: string,
  assets: TitleRunAssets,
): readonly NamespaceTitleRun[] {
  const runs: NamespaceTitleRun[] = [];
  for (const atom of atoms) {
    if (atom.kind === 'text') {
      runs.push({
        kind: 'text',
        text: atom.text,
        font: atom.font,
        ...(atom.url !== undefined ? { url: atom.url } : {}),
      });
      continue;
    }
    if (atom.kind === 'inline') {
      const resolved = resolveInlineAtom(atom.atom, font, assets.sprites, assets.spriteDims);
      if (resolved !== undefined) runs.push(resolved);
    }
  }
  return runs.length > 0 ? runs : [{ kind: 'text', text: label, font }];
}

/** The summed advance of `runs`, a text run measured in its own font (`Neutron#getWidth`). */
function runsWidth(measurer: StringMeasurer, runs: readonly NamespaceTitleRun[]): number {
  let width = 0;
  for (const run of runs) {
    width += run.kind === 'text' ? measurer.measure(run.text, atomFontSpec(run.font)).width : run.width;
  }
  return width;
}

/** One physical title line, `Fission#getSplitted` at `wrapWidth` (> 0): the runs of each wrapped sub-line. */
export function wrappedTitleRuns(
  line: string,
  font: FontConfiguration,
  measurer: StringMeasurer,
  wrapWidth: number,
  assets: TitleRunAssets,
): readonly (readonly NamespaceTitleRun[])[] {
  const atoms = buildLineAtoms(manageGuillemet(line), font).atoms;
  const measureAtom = (atom: CreoleAtom): number => runsWidth(measurer, atomRuns([atom], font, '', assets));
  return getSplitted(atoms, wrapWidth, measureAtom).map((group) => atomRuns(group, font, line, assets));
}
