# Why no Smetana support?

PlantUML has a second layout engine, Smetana, and plantuml-ts does not port it.
`!pragma layout smetana` is accepted, but every diagram is laid out by
[`@knowvah/dot-engine`](https://dot-engine.knowvah.com/), our own TypeScript port
of Graphviz. This is a settled decision (maintainer ruling, 2026-08-09), and it's
the main reason the JSON, YAML and HCL rows on the [parity page](/parity) stop
short of conformant.

## How we got here

**Graphviz is a C program.** PlantUML doesn't compute graph layout itself. For
class, state, component and similar diagrams it starts Graphviz's `dot` as a
separate process and reads the answer back.

**That has costs for a Java tool.** PlantUML's own
[account of the project](https://plantuml.com/smetana02) lists them: a new
process for every diagram, a second program to install next to Java, and a tool
that isn't fully portable as a result.

**Smetana is PlantUML's answer: Graphviz, translated to Java.** The translation
works from the C source of Graphviz 2.38.0, which was tagged in April 2014. Each
translated method still carries an annotation naming its C file and that version,
such as `@Original(version="2.38.0", path="lib/gvc/gvc.c", ...)`. The earliest
Smetana code in PlantUML's git history is from March 2016.

**PlantUML ended up with two layout engines.** Most diagram types still shell out
to real Graphviz. Smetana handles `@startjson`, `@startyaml`, `@starthcl` and
`@startgit`, plus anything with `!pragma layout smetana`.

**Graphviz kept moving, and Smetana stayed at 2.38.** Later Graphviz releases
changed the arithmetic that decides sizes, arrowheads and spline ends, so the two
engines no longer agree to the pixel, even though they share an algorithm.

**plantuml-ts began in April 2026** with in-house layout code, ported in part from
Smetana. In June 2026 we replaced it with a new port made directly from the
Graphviz C source, named `@knowvah/dot-engine` since July 2026. It has no native
binary and no WASM, so it runs in a browser, and it's checked against native
Graphviz with coordinates matching to within 0.01.

## Why we don't port Smetana as well

- **One layout implementation is enough.** Two would mean two sets of behaviour to
  reason about, test and fix, and to keep in agreement.
- **It would mean copying a copy.** Smetana's output is Graphviz as it was in 2014,
  plus whatever the translation introduced. Matching it exactly would mean
  reproducing those differences on purpose.
- **Real Graphviz is the better reference.** Where PlantUML uses the `dot` binary,
  its geometry is what we're held to, and dot-engine already reproduces that
  arithmetic.
- **We can change dot-engine.** We maintain and publish it, so a layout defect can
  be fixed where it lives.

## What it costs

On the Smetana diagram types you get the same diagram: the same elements, labels,
colours and structure, with node sizes and text metrics held to PlantUML. Edge
routing and node spacing may differ.

We traced every non-conformant JSON, YAML and HCL fixture to its cause. The input we
give the layout engine equals PlantUML's, and dot-engine's answer equals real `dot`
16.1.0 on that input. What's left is the difference between the two Graphviz eras:

| What differs | Smetana (Graphviz 2.38) | dot-engine (current Graphviz) | Changed in Graphviz |
|---|---|---|---|
| Record node size | Rounds the declared size; no field padding | Keeps the size unrounded | 8.0.4 (April 2023) |
| Where a spline is clipped | Keeps the last point outside the node | Keeps the last point inside | 7.0.0 (October 2022) |
| Arrowhead length | Fixed at 7.5 | Accounts for line width, about 9.0 | 7.0.0 (October 2022) |
| Node position within a rank | Network simplex result | Same algorithm, ties break differently | No single commit identified |

Most of the gaps are small: when measured on 2026-10-30, nodes were within 1 px on
44 of the 66 fixtures that could be aligned. The in-rank difference is the exception,
at up to 127 px on one large JSON document. The
[divergences page](/divergences#smetana-backed-diagram-types-—-laid-out-by-dot-engine-geometry-differs-measured-graphviz-2-38-vs-modern-arithmetic)
has the row-by-row table.

## What stays held to PlantUML

The exemption is a closed set: `@startjson`, `@startyaml`, `@starthcl`, `@startgit`
and `!pragma layout smetana`. On those diagrams our priority is readability first,
SVG fidelity second.

Every other diagram type is held to PlantUML's geometry and measured fixture by
fixture on the [parity page](/parity).
