/**
 * `FtileWithUrl#drawU` over the activity node stream: `ug.startUrl(url)`, the
 * wrapped tile's own drawing, `ug.closeUrl()` -- every node a walker marked with
 * the same `url` (`layout/tile-coordinates.ts#markUrl`) lands inside ONE `<a>`.
 * The raw `[[...]]` is resolved here, where the theme's `topurl` is known
 * (`UrlBuilder(skinParam.getValue("topurl"), STRICT)`, `CommandIf2.java:139-145`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/FtileWithUrl.java:56-60
 */
import { linkWrap } from '../../core/svg.js';
import type { Theme } from '../../core/theme.js';
import { UrlBuilder } from '../../core/url/UrlBuilder.js';
import { UrlMode } from '../../core/url/UrlMode.js';
import type { ActivityNodeGeo } from './activity-geometry.types.js';

/** `svgs[i]` is `nodes[i]` drawn; consecutive entries sharing a `url` collapse into one linked entry. */
export function wrapUrlRuns(nodes: readonly ActivityNodeGeo[], svgs: readonly string[], theme: Theme): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < nodes.length) {
    const raw = nodes[i]!.url;
    let j = i + 1;
    if (raw !== undefined) while (j < nodes.length && nodes[j]!.url === raw) j++;
    const run = svgs.slice(i, j).join('');
    out.push(raw === undefined ? run : linkedRun(run, raw, theme));
    i = j;
  }
  return out;
}

function linkedRun(run: string, raw: string, theme: Theme): string {
  const url = new UrlBuilder(theme.topurl ?? null, UrlMode.STRICT).getUrl(raw);
  return url === null ? run : linkWrap(run, { url: url.getUrl(), tooltip: url.getTooltip() });
}
