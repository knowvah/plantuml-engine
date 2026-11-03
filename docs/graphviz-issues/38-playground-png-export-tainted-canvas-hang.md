# Docs playground PNG export: a tainted canvas leaves the export hanging, with no message

**Impact:** no plantuml-ts fixture, and no effect on the published package. The
code is in dot-engine's docs site (`docs-site/.vitepress/theme/Playground.vue`),
not in the `.tgz` plantuml-ts pins. It is latent: none of the DOT inputs tried
below makes dot-engine's playground taint its canvas, so no user path to it is
known. Found while porting this export to plantuml-ts's playground (PR #105),
whose math output does taint the canvas.

**Finding.** `svgToPng` calls `canvas.toBlob` inside `img.onload`. That callback
runs after the Promise executor has returned, so a synchronous throw there
cannot reject the Promise. On a tainted canvas `toBlob` throws `SecurityError`
synchronously. The error goes to `window.onerror` and the Promise never settles,
so the `try`/`catch` in `exportPng` never runs: no file, and no
`PNG export failed` message.

```ts
img.onload = () => {
  // ...
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(
    (b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))),
    'image/png',
  );
};
```

The `null` callback path (`PNG encoding failed`) is handled. Only the synchronous
throw escapes.

## Repro

The same control flow as `svgToPng`, run in headless Chromium (Playwright
`chromium_headless_shell-1243`) with `@knowvah/dot-engine` 2.4.0. "Input" is what
was rasterized through the `blob:` URL; the DOT rows went through
`renderSvg(src, 'dot')`, and `<fo>` is a base64 `data:image/svg+xml` URL of an SVG
holding a `<foreignObject>`.

| Input | `<image>` in output | Outcome |
| --- | --- | --- |
| `digraph{a->b}` | no | resolved, PNG produced |
| `digraph{a[image="<fo>"]}` | no | resolved; `Error: No or improper image file=...` |
| `digraph{a[label=<<TABLE><TR><TD><IMG SRC="<fo>"/></TD></TR></TABLE>>]}` | no | resolved |
| `digraph{a[shapefile="<fo>"]}` | no | resolved; `Warning: No or improper shapefile=...` |
| Control, not DOT: hand-written SVG with `<image xlink:href="<fo>"/>` | yes | **never settled** (3 s race) |

The control's uncaught error:

```
Uncaught SecurityError: Failed to execute 'toBlob' on 'HTMLCanvasElement':
Tainted canvases may not be exported.
```

Not measured: Firefox, WebKit, and DOT routes other than those in the table. The
playground calls `renderSvg` with no `imageSizer`; the async `imageSizer` and
`imageResolver` options were not tried, because the playground does not use them.

## How plantuml-ts handles it

For comparison only. plantuml-ts's playground
(`docs-site/.vitepress/theme/Playground.vue`) rasterizes through a `data:` URL,
because a `blob:` URL taints math output
(`.agent-notes/playground-export.md`). It awaits the image load first and calls
`toBlob` inside a Promise executor, so a throw there rejects, and `exportPng`
reports it beside the export buttons.
