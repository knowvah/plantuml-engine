/**
 * Container/creation commands for the class diagram dispatch table (rules
 * 4-5g of the original class-commands.ts COMMANDS array): brace close,
 * `together {`, namespace/package blocks, descriptive containers, the `()`
 * lollipop declaration, diamond associations, association-class couples,
 * `note on link`, `constraint on links`, and `url`. Split out of
 * class-commands.ts to stay under the line cap; order preserved (spread
 * second in COMMANDS, right after the directive group).
 */
import { applyAssocCouple, ASSOC_COUPLE_RE, ASSOC_DOUBLE_COUPLE_RE } from './class-assoc-couple.js';
import { applyDoubleCouple } from './class-assoc-double-couple.js';
import { refuse } from '../../core/parse-refusal.js';
import type { Command } from './class-command-types.js';
import type { Visibility } from './ast.js';
import type { ParseState } from './parser.js';
import {
  openNamespaceBlock,
  setNamespaceStereotype,
  setNamespaceTags,
  setNamespaceUrl,
  setNamespaceColor,
  NAMESPACE_COMMANDS,
} from './class-container.js';
import { collapseEmptyNamespace } from './class-namespace.js';
import { closeBraceScope, openTogetherBlock } from './class-together.js';
import {
  applyConstraintOnLinks,
  applyNoteOnLink,
  resolveLinkNotePosition,
  CONSTRAINT_ON_LINKS_RE,
  NOTE_ON_LINK_RE,
  NOTE_ON_LINK_MULTI_RE,
  NOTE_COLOR,
} from './class-notes.js';
import { applyUrlStatement, URL_STATEMENT_RE } from './class-url-command.js';
import { ensureClassifier } from './parser.js';
import { COMMAND_PACKAGE_RE, commandPackageArgs } from './class-command-package.js';
import { parseTagTokens } from './class-declaration-parser.js';

/**
 * Order matters: patterns are tested top-to-bottom; first match wins.
 */
/** `%g` -- PlantUML's double-quote class (`"`, U+201C, U+201D, U+E121;
 *  the same set `core/url/UrlBuilder.ts` expands). */
const G = String.raw`["\u201C\u201D\uE121]`;
const NOT_G = String.raw`[^"\u201C\u201D\uE121]`;
const NOT_G_CODE = String.raw`[^#\s{}"\u201C\u201D\uE121]`;

/**
 * cdd6-T3d (xuloxo-85-vibu502): `CommandPackageWithUSymbol`'s name head, the
 * RegexOr of five alternatives tried left to right, eleven capture groups
 * (match indices 2-12 after the SYMBOL group):
 *
 *   DISPLAY1 `[%g].+?[%g]` [STEREOTYPE1] `as` CODE1 `[^#%s{}]+`       (2,3,4)
 *   CODE2 `[^#%s{}%g]+` [STEREOTYPE2] `as` DISPLAY2 `[%g].+?[%g]`     (5,6,7)
 *   DISPLAY3 `[^#%s{}%g]+` [STEREOTYPE3] `as` CODE3 `[^#%s{}%g]+`     (8,9,10)
 *   CODE8 `[%g][^%g]+[%g]`                                          (11)
 *   CODE9 `[^#%s{}%g]*`                                             (12)
 *
 * The stereotype may therefore sit BEFORE `as` (C4's `rectangle "D"
 * <<person>> as X {`); the old head accepted `as` only before it and the
 * trailing `[#<][^{]*` swallowed `<<person>> as X`, losing both the
 * stereotype and the alias. Quoted displays are captured inside their
 * quotes (`eventuallyRemoveStartingAndEndingDoubleQuote`, java:180,183).
 * CODE9 is ported as `+`, not `*`: the empty-code branch
 * (`getUniqueSequence("##")`, display null, java:181-188) is not ported.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/command/CommandPackageWithUSymbol.java:79-116
 */
const USYMBOL_CONTAINER_HEAD =
  `(?:${G}(.+?)${G}(?:\\s+(<<.+>>))?\\s*as\\s+([^#\\s{}]+)` +
  `|(${NOT_G_CODE}+)(?:\\s+(<<.+>>))?\\s*as\\s+${G}(.+?)${G}` +
  `|(${NOT_G_CODE}+)(?:\\s+(<<.+>>))?\\s*as\\s+(${NOT_G_CODE}+)` +
  `|${G}(${NOT_G}+)${G}` +
  `|(${NOT_G_CODE}+))`;

/**
 * The head's `getLazzy("CODE")`/`getLazzy("DISPLAY")`/`getLazzy("STEREOTYPE")`
 * reads (`CommandPackageWithUSymbol.java:178-205`): `display` falls back to
 * the code when no DISPLAY alternative matched (`ident.getName()`, java:186).
 * `stereotype` is the in-head STEREOTYPEn; the caller falls back to the
 * trailing STEREOTYPE group. When both are present `getLazzy` answers the
 * first in match order, the in-head one (`RegexResult.java:128-149`, e2659a157bf).
 */
function usymbolContainerHead(match: RegExpExecArray): { code: string; display: string; stereotype?: string } {
  const first = (groups: readonly number[]): string | undefined =>
    groups.map((g) => match[g]).find((v) => v !== undefined);
  // CODE1, CODE2, CODE3, CODE8, CODE9 -- exactly one alternative matched.
  const code = first([4, 5, 10, 11, 12])!;
  const display = first([2, 7, 8]) ?? code;
  const stereotype = first([3, 6, 9]);
  return stereotype !== undefined ? { code, display, stereotype } : { code, display };
}

/**
 * cdd6-T3d (topave-65-ceso890): `CommandPackage.executeArg`'s
 * `p.setVisibilityModifier(VisibilityModifier.getVisibilityModifier(
 * visibilityString + "FOO", false))` -- the char alone selects the modifier
 * (`[-#+~]`, `VisibilityModifier.java:75-77`); `false` is the METHOD
 * variant, which the drawn `<g data-visibility-modifier>` names.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandPackage.java:189-192
 */
function setNamespaceVisibility(state: ParseState, nsId: string, visibility: string | undefined): void {
  if (visibility === undefined) return;
  const ns = state.ast.namespaces.find((n) => n.id === nsId);
  if (ns !== undefined) ns.visibilityModifier = visibility as Visibility;
}

export const CONTAINER_COMMANDS: readonly Command[] = [
  // 4. Closing brace — ends a pending body, together block, or namespace
  //    block (LIFO; see closeBraceScope in class-together.ts).
  { pattern: /^\}\s*$/, execute: (state) => closeBraceScope(state) },

  // 4b. `together {` (CommandTogether, ClassDiagramFactory.java:131) — a
  //     layout-proximity grouping with no comparator-visible DOT cluster; see
  //     openTogetherBlock (class-together.ts).
  { pattern: /^together\s*\{\s*$/i, execute: (state) => openTogetherBlock(state) },

  // 4b/5. Namespace block commands (CommandNamespace2 + CommandNamespace) —
  //       moved to class-container.ts (NAMESPACE_COMMANDS) to keep this file
  //       under the line cap; order preserved (2 tried first).
  ...NAMESPACE_COMMANDS,

  // 5b. Package block (CommandPackage, ClassDiagramFactory.java:127). Upstream
  //     routes package through the same PACKAGE group as namespace, so it
  //     clusters alike. The regex and its CODE/DISPLAY reads are
  //     `class-command-package.ts` (#2846's two-branch RegexOr); the tail
  //     groups are the ones this rule always carried: `$tag` runs TAGS1/TAGS2
  //     around the STEREOTYPE slot (`CommandPackage.java:129-131`, read by
  //     `setNamespaceTags`), the `<<stereotype>>` (gated: a USymbol-naming
  //     stereotype selects the shape instead, java:207-226), the `[[url]]`
  //     and the BACK colour (java:230-238), and the leading VISIBILITY char
  //     (java:93, stored by `setNamespaceVisibility`, java:218-223;
  //     `ClusterHeader.java:130-138` draws it left of the title). A second
  //     `<<B>>` widens the lazy STEREOTYPE group (`StereotypePattern.java:
  //     66-67`) because nothing follows COLOR but `\s*\{` (`mupavi-50-fijo192`).
  {
    pattern: COMMAND_PACKAGE_RE,
    execute(state, match) {
      const { idRaw, display } = commandPackageArgs(match);
      // `CommandPackage.java:201-202`: an empty CODE is an execution error, so the next
      // factory runs (`PSystemBuilder.java:136-140`, D10).
      if (idRaw.length === 0) {
        const at = state.currentLine ?? 0;
        state.executionRefusal = refuse('execution', at, at, 'Error in name', 0);
        return;
      }
      // `displayResolved = display == null ? quark.getName() : display` (java:205): passing the id
      // as display keeps `openNamespaceBlock`'s segment (quark-name) title.
      const effectiveId = openNamespaceBlock(state, idRaw, display ?? idRaw);
      setNamespaceStereotype(state, effectiveId, match[7], true);
      setNamespaceTags(state, effectiveId, `${match[6] ?? ''} ${match[8] ?? ''}`);
      setNamespaceUrl(state, effectiveId, match[9]);
      setNamespaceColor(state, effectiveId, match[10]);
      setNamespaceVisibility(state, effectiveId, match[1]);
    },
  },

  // 5b-empty. Same-line `X {}` (CommandPackageEmpty, ClassDiagramFactory.java:129),
  //     tried after CommandPackage like upstream; collapsed immediately. This is
  //     the pre-#2846 package grammar restricted to the `{}` close (#2846 left
  //     CommandPackageEmpty untouched, so `package "" as p {}` still lands here).
  {
    pattern: new RegExp(
      String.raw`^(?:([-#+~])\s*)?package\b\s*(?:"([^"]*)"|([^\s#<{]+))?(?:\s+as\s+([^\s{]+))?((?:\s+\$[^\s{}"'<>$]+)*)(?:\s*(<<.+?>>))?((?:\s+\$[^\s{}"'<>$]+)*)(?:\s*(\[\[[^\]]*\]\]))?\s*` +
        NOTE_COLOR +
        // T11: a `\s*` gap here is load-bearing -- without it a trailing space
        // before `{` (`#DDD {`) fails the match at NOTE_COLOR's end position.
        String.raw`\s*\{\s*\}\s*$`,
      'i',
    ),
    execute(state, match) {
      const name = match[2] ?? match[3];
      let effectiveId: string;
      if (name !== undefined) {
        effectiveId = openNamespaceBlock(state, match[4] ?? name, name, 'package');
      } else {
        const id = '__pkg' + String(state.ast.namespaces.length);
        effectiveId = openNamespaceBlock(state, id, '');
      }
      setNamespaceStereotype(state, effectiveId, match[6], true);
      setNamespaceTags(state, effectiveId, `${match[5] ?? ''} ${match[7] ?? ''}`);
      setNamespaceUrl(state, effectiveId, match[8]);
      setNamespaceColor(state, effectiveId, match[9]);
      setNamespaceVisibility(state, effectiveId, match[1]);
      state.ast.namespaces = collapseEmptyNamespace(
        state.ast.namespaces,
        state.classifierIndex,
        state.ast.classifiers,
        effectiveId,
      );
      state.activeNamespace = state.namespaceStack.pop() ?? null;
    },
  },

  // 5b'. Descriptive container (CommandPackageWithUSymbol): `stack a as a {`,
  //      `rectangle "Y" as Z [[url]] {`. Non-empty → cluster; EMPTY → rect leaf on close.
  {
    pattern:
      // `$tag` runs on BOTH sides of the stereotype, as `TAGS1`/`TAGS2`
      // (`CommandPackageWithUSymbol.java:121,123`) -- the same pair rule 5's
      // `package` pattern above already carries. Without them
      // `component C1 $tag1 {` matched no container command at all, so the
      // block never opened and its BODY went unparsed: `component C1 $tag1 {
      // qwe rty !!! }` was accepted whole. That let the class engine claim
      // `component/jebovo-64-rasa849` and `sodoza-93-nanu557`, which the jar
      // routes to DESCRIPTION -- upstream's class factory refuses them on the
      // nested `node n` leaf, via `CommandCreateElementFull2`'s allowmixing
      // gate, and only reaches that gate because the container DID open.
      // T5 M2 (unknown-bucket-routing-repair): `action`/`process` added --
      // both are already present in `class-descriptive-leaf-command.ts`'s
      // `CONTAINER_KEYWORD` (CommandPackageWithUSymbol's own SYMBOL
      // alternation verbatim) but were absent from THIS list, so `action
      // action {` fell to the DESCRIPTIVE_LEAF_COMMANDS fallback's
      // `isContainerOpener` exemption instead of opening a real container --
      // the nested body's own lines were then never re-dispatched through
      // the per-line/allowmixing gate at all.
      // #2846: `package` added -- the SYMBOL alternation's first keyword
      // (`CommandPackageWithUSymbol.java:86-87`). It was unreachable while
      // CommandPackage's NAME took any `[^#%s{}]*`; its CODE_BAREWORD
      // (`[%pLN_.$]*`, `CommandPackage.java:87`) now leaves `package foo-bar {`
      // to this command, which displays the stereotype ungated and stamps the
      // `package` keyword's USymbol (`:194-206`).
      new RegExp(
        String.raw`^(package|rectangle|node|component|folder|frame|cloud|database|storage|artifact|file|card|queue|stack|hexagon|agent|action|process)\s+` +
          USYMBOL_CONTAINER_HEAD +
          String.raw`((?:\s+\$[^\s{}"'<>$]+)*)(?:\s*(<<.+?>>))?((?:\s+\$[^\s{}"'<>$]+)*)(?:\s*(\[\[[^\]]*\]\]))?\s*` +
          NOTE_COLOR +
          // `CommandPackageWithUSymbol.java:126-129`: nothing follows COLOR but `\s*\{` -- so a second `<<B>>`
          // widens the lazy STEREOTYPE group (`StereotypePattern.optional`) instead of being swallowed here (cogr T3e).
          String.raw`\s*\{\s*$`,
        'i',
      ),
    execute(state, match) {
      const usymbol = match[1]!.toLowerCase();
      const head = usymbolContainerHead(match);
      const effectiveId = openNamespaceBlock(state, head.code, head.display);
      state.descriptiveContainers.set(effectiveId, usymbol);
      // cdd2-T19b: `if (stereotype != null) p.setStereotype(Stereotype
      // .build(stereotype, false))` -- UNGATED (the SYMBOL token already
      // named the shape), so the stereotype is displayed in the cluster
      // header (`CommandPackageWithUSymbol.java:204-206`).
      setNamespaceStereotype(state, effectiveId, head.stereotype ?? match[14], false);
      // `addTags(p, arg.getLazzy("TAGS", 0))` -- upstream applies BOTH tag
      // runs to the group it just created (`CommandPackageWithUSymbol
      // .java:214`). `remove $tag` / `restore $tag` resolve against them, so
      // discarding them here would leave `component a $a {}` un-removable
      // (kokebo-27-vafi688).
      const tags = parseTagTokens(`${match[13] ?? ''} ${match[15] ?? ''}`);
      if (tags.length > 0) state.pendingContainerTags.set(effectiveId, tags);
      // cdd3-T10 (S-11): `p.addUrl(url)` (`CommandPackageWithUSymbol.java:
      // 208-213`) and `p.setColors(color().getColor(...))` with
      // `ColorType.BACK` (`:215-216`, `color()` at `:132-134`).
      setNamespaceUrl(state, effectiveId, match[16]);
      setNamespaceColor(state, effectiveId, match[17]);
    },
  },

  // 5b''. `() "name"` interface lollipop (CommandCreateElementParenthesis) — a
  //       plaintext circle node (same svek shape as a `circle` element).
  //       cdd5-T4b: groups 1/2 are the CODE3 `as` DISPLAY3 alternative
  //       (`CommandCreateElementParenthesis.java:94-104`: "CODE3" CODE,
  //       spaceOneOrMore, "as", spaceZeroOrMore, "DISPLAY3" DISPLAY) -- a
  //       bare code followed by a quoted display, which the two earlier
  //       alternatives cannot match. Tried first here: for that shape it is
  //       the only alternative upstream accepts. The display is unquoted by
  //       `eventuallyRemoveStartingAndEndingDoubleQuote` (java:197).
  {
    pattern: /^\(\)\s+(?:([\p{L}\p{N}_.]+)\s+as\s*"([^"]+)"|(?:"([^"]*)"|(\S+))(?:\s+as\s+(\S+))?)\s*$/u,
    execute(state, match) {
      if (match[1] !== undefined) {
        ensureClassifier(state, match[1], 'circle', match[2]).kind = 'circle';
        return;
      }
      const name = match[3] ?? match[4]!;
      ensureClassifier(state, match[5] ?? name, 'circle', name).kind = 'circle';
    },
  },

  // 5c. Association diamond: `<> name` (CommandDiamondAssociation) — a
  //     diamond-shaped n-ary/association-class connector node.
  {
    pattern: /^<>\s+(\S+)\s*$/,
    execute(state, match) {
      // cdd-T34 (E14, luzive-62-zote562): `CommandDiamondAssociation
      // .executeArg` (`classdiagram/command/CommandDiamondAssociation.java:
      // 73-84`) refuses UNCONDITIONALLY whenever `quark.getData() != null`
      // -- i.e. whenever ANY entity already exists at this id, whatever its
      // origin (an explicit `class X {}` declaration, OR an earlier
      // relationship endpoint that auto-vivified a placeholder) -- "Unlike
      // most creation commands, executeArg fails if the name already
      // exists" (that method's own `explainArg` comment). `ensureClassifier`
      // passes `kind: 'association'` as the CREATE-time default, so a
      // freshly-minted classifier already has `.kind === 'association'`
      // the instant it's created -- nothing else in this port ever creates
      // one with that kind, so `classifier.kind !== 'association'` here is
      // exactly upstream's `quark.getData() != null`: this id already
      // named something before this line ran.
      const classifier = ensureClassifier(state, match[1]!, 'association');
      if (classifier.kind !== 'association') {
        (state.ast.errors ??= []).push(`Already existing : ${classifier.id}`);
        state.ast.errorLine = state.currentLine;
        return;
      }
      classifier.kind = 'association';
    },
  },

  // 5d. Association-class couple. Double `(A,B).(C,D)` before single `(A,B)..C`.
  // Endpoint resolution mirrors CommandLinkClass's couple handling
  // (executeArgSpecial1/2/3, reuseExistingChild=true for every A/B/C/D
  // endpoint) — a bare endpoint name may reuse an existing classifier.
  {
    pattern: ASSOC_DOUBLE_COUPLE_RE,
    execute(state, match) {
      // cdd-T3 (A1 SB3): the double couple burns jar's shared counter too --
      // see `stampDoubleCouple` (class-assoc-double-couple.ts).
      applyDoubleCouple(
        state.ast,
        (id) => ensureClassifier(state, id, undefined, undefined, true),
        match.input,
        state.creationCounter,
        state.activeNamespace,
      );
    },
  },
  {
    pattern: ASSOC_COUPLE_RE,
    execute(state, match) {
      // G2 N19: single-coupling-only creationIndex/synthetic-name tracking
      // -- see `AssocCoupleCounter`'s doc comment (class-assoc-couple.ts).
      applyAssocCouple(
        state.ast,
        (id) => ensureClassifier(state, id, undefined, undefined, true),
        match.input,
        state.creationCounter,
        state.activeNamespace,
      );
    },
  },

  // 5e. `note on|of link: text` — see NOTE_ON_LINK_RE's doc (class-notes.ts).
  // T10: position is now group 1 (optional, default BOTTOM); cdd2-T19c:
  // group 2's NOTE_COLOR is now wired through to `applyNoteOnLink`, which
  // parses it via `parseNoteOnLinkColors`; text is group 3.
  {
    pattern: NOTE_ON_LINK_RE,
    execute: (state, match) => {
      // `CommandFactoryNoteOnLink.java:204-206`: `getLastLink() == null` -> error("No link defined").
      if (state.ast.relationships.length === 0) {
        const at = state.currentLine ?? 0;
        state.executionRefusal = refuse('execution', at, at, 'No link defined', 0);
        return;
      }
      applyNoteOnLink(state.ast, resolveLinkNotePosition(match[1]), match[3]!, match[2]);
    },
  },

  // 5e-multi. `note [pos] on|of link [#color]` (no colon) — opens a
  // multi-line note-on-link block closed by `end note`. See
  // NOTE_ON_LINK_MULTI_RE's doc (class-notes.ts). cdd2-T19c: group 2's
  // NOTE_COLOR is now carried on the pending note, applied at `end note`
  // (`finalizePendingNote`'s `'link'` branch, class-notes.ts).
  {
    pattern: NOTE_ON_LINK_MULTI_RE,
    execute: (state, match) => {
      state.pendingNote = {
        kind: 'link',
        position: resolveLinkNotePosition(match[1]),
        textLines: [],
        ...(match[2] !== undefined ? { color: match[2] } : {}),
      };
    },
  },

  // 5f. `constraint on links` — see CONSTRAINT_ON_LINKS_RE (class-notes.ts).
  { pattern: CONSTRAINT_ON_LINKS_RE, execute: (state, match) => applyConstraintOnLinks(state.ast, match[1] ?? '') },

  // 5g. `url [of|for] <Code> [is] [[...]]` — CommandUrl.java (README item
  //     #7, G2 N15). Attaches a url to an ALREADY-DECLARED classifier;
  //     silent no-op when the target doesn't exist (mirrors this port's
  //     established no-throw posture for unresolvable post-hoc directives —
  //     see class-notes.ts's "Nothing to note to" precedent — rather than
  //     upstream's thrown error).
  { pattern: URL_STATEMENT_RE, execute: (state, match) => applyUrlStatement(state, match[1]!, match[2]!) },
];
