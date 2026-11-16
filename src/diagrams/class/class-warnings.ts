/**
 * Class diagram skinparam warnings: `CommandSkinParam#executeArg` adds a `Warning` for some line-form
 * assignments (`ParticipantPadding`, `handwritten`, `padding`), `TitledDiagram#getWarnings` collects them and
 * `DiagramChromeFactory#addWarnings` draws them as a banner above the body, before any title/legend chrome.
 * The warning table and the banner are the shared `core/skinparam-warnings.ts` (description and ten other
 * engines use it); this module only threads them through the class plugin.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandSkinParam.java:88-99
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:326-334
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramChromeFactory.java:128
 */
import type { RenderFragment } from '../../core/dispatcher.js';
import { CUCA_DOCUMENT_MARGIN, calculateMargin } from '../../core/document-margin.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { firstPageAssignments } from '../../core/preprocessor-first-page.js';
import { skinParamWarnings, withWarningBanner } from '../../core/skinparam-warnings.js';
import type { Theme } from '../../core/theme.js';
import type { UmlSource } from '../../core/block-extractor.js';
import type { Warning } from '../../core/warning/Warning.js';
import type { ClassDiagramAST } from './ast.js';

/** Fixed id namespace for the banner's own klimt document (it emits no defs). */
const BANNER_UID = 'class-warning-banner';

/**
 * `ast` with `warnings` set to `CommandSkinParam#executeArg`'s warnings for the first page's line-form
 * `skinparam` assignments (the same page filter description applies, `description/index.ts#parse`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandSkinParam.java:92-99
 */
export function withSkinParamWarnings(ast: ClassDiagramAST, block: UmlSource): ClassDiagramAST {
  const source = block.styleSource;
  const warnings = skinParamWarnings(
    source?.skinparamAssignments === undefined
      ? source
      : {
          ...source,
          skinparamAssignments: firstPageAssignments(source.skinparamAssignments, block.lines, block.linePositions),
        },
  );
  return warnings.length === 0 ? ast : { ...ast, warnings };
}

/**
 * `DiagramChromeFactory#addWarnings` over the class fragment: the shared banner stacked above the body, inside
 * the document margin the exporter applies (`CucaDiagram#getDefaultMargins`, or a style `Margin`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramChromeFactory.java:176-200
 */
export function withClassWarningBanner(
  fragment: RenderFragment,
  warnings: readonly Warning[] | undefined,
  measurer: StringMeasurer | undefined,
  theme: Theme,
): RenderFragment {
  if (warnings === undefined || measurer === undefined) return fragment;
  return withWarningBanner(fragment, warnings, measurer, calculateMargin(theme, CUCA_DOCUMENT_MARGIN), BANNER_UID);
}
