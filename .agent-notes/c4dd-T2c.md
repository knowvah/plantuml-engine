## Observation: compareSvg cannot see the root's width and height
- **Context**: `rosoga-84`'s root read 171px against the jar's 171.875px and still compared clean.
- **Finding**: `normalize.ts#buildAttrs` applies `style` declarations over presentation attributes, so the root's `style="width:171px;..."` overwrites `width`. The fractional attribute never reaches the comparison.
- **Impact**: A root size or a comment needs a byte assertion; a conformant verdict says nothing about either.
- **Confidence**: High.
