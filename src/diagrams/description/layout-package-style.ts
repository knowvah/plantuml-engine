/**
 * `skinparam packagestyle` -> the `package` keyword's group symbol.
 *
 * `CommandPackageWithUSymbol.executeArg` resolves the group's `USymbol` once, at parse time:
 * `USymbols.fromString(symbol, actorStyle, componentStyle, packageStyle())` (`CommandPackageWithUSymbol.java:194`),
 * and for the keyword `package` that is `packageStyle.toUSymbol()` (`USymbols.java:103-104`; node -> NODE,
 * rect -> RECTANGLE, ... `PackageStyle.java:69-92`). Everything downstream -- the cluster-label supplements
 * (`ClusterHeader.java:88-93`), the style signature (`ClusterHeader.java:155-163`), the SName-keyed fonts and
 * colours, `ClusterDotString.java:308` -- reads that symbol, not the keyword. The port keeps skinparams in the
 * `Theme`, so the rewrite happens once at the layout entry (the same place `componentStyle` takes effect).
 *
 * Styles whose `toUSymbol()` is null (AGENT, STORAGE, COMPONENT1/2, ARTIFACT) keep the `package` keyword: the
 * group's symbol is null upstream, its style signature is `package_` (`ClusterHeader.java:160-161`), and
 * `usymbol-resolve.ts#resolveSymbol` answers null for it.
 */
import type { Theme } from '../../core/theme.js';
import type { USymbol } from '../../core/descriptive-keywords.js';
import { PackageStyle } from '../../core/decoration/symbol/USymbols.js';
import { resolvePackageStyle } from '../../core/decoration/symbol/usymbol-resolve.js';
import type { DescriptiveNode } from './ast.js';

/** The keyword whose `USymbol` is `PackageStyle#toUSymbol()` for the styles that have one (`PackageStyle.java:69-92`). */
const KEYWORD_BY_PACKAGE_STYLE: Readonly<Partial<Record<PackageStyle, USymbol>>> = {
  [PackageStyle.NODE]: 'node',
  [PackageStyle.CARD]: 'card',
  [PackageStyle.DATABASE]: 'database',
  [PackageStyle.CLOUD]: 'cloud',
  [PackageStyle.FRAME]: 'frame',
  [PackageStyle.RECTANGLE]: 'rectangle',
};

/** An empty `package` group: upstream gave it the package-style `USymbol` at parse time like any other. */
function isEmptyPackageGroup(n: DescriptiveNode): boolean {
  return n.symbol === 'package' && n.declaredAsGroup === true;
}

function restyle(nodes: readonly DescriptiveNode[], keyword: USymbol): DescriptiveNode[] {
  return nodes.map((n) => {
    if (n.children.length === 0) return isEmptyPackageGroup(n) ? { ...n, symbol: keyword } : n;
    const children = restyle(n.children, keyword);
    return n.symbol === 'package' ? { ...n, symbol: keyword, children } : { ...n, children };
  });
}

/**
 * Rewrites every `package` group to the skin's package-style keyword. An empty one is an `EMPTY_PACKAGE` leaf
 * (`GraphvizImageBuilder.java:425-427`), but the symbol was set at parse time, so `GeneralImageBuilder.java:205-207`
 * draws it with `EntityImageDescription` in that symbol (a `rectangle`, a `node`, ...), not `EntityImageEmptyPackage`
 * (ptw, #219 push-forward: `skinparam packageStyle rectangle` on an empty package). Returns `nodes` itself when the
 * style rewrites nothing.
 */
export function applyPackageStyle(nodes: DescriptiveNode[], theme: Theme): DescriptiveNode[] {
  const keyword = KEYWORD_BY_PACKAGE_STYLE[resolvePackageStyle(theme)];
  return keyword === undefined ? nodes : restyle(nodes, keyword);
}
