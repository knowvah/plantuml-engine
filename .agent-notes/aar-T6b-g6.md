## Observation: `<<icon>>` is FtileBoxEmoji; compress anchors on the first draw, not on text
- **Context**: aar-T6b group 6 (dejuko-37, jexavu-72, pedulu-06).
- **Finding**: `VCompactFactory.java:140-141` builds `FtileBoxEmoji` (no outline, emoji + name blocks) for a
  stereogroup that is exactly `<<icon>>`. Its ink and compression slots are the drawn shapes
  (`layout/compress/shapes-of-emoji.ts`), and a label made only of images (`<latex>`) leaves no `SlotFinder` slot
  (`SlotFinder.java:84-109` has no UImage/UImageSvg branch) and moves with its first draw point.
- **Impact**: any new tile that draws sprites needs ink (`canvas-origin*`) and slot (`compress/shapes-of*`) entries.
- **Confidence**: High

## Observation: nomave-73 is the MIT-edition QR divergence, not a port defect
- **Context**: `<qrcode:abcdef>` is 87x87 in the jar, 30x30 here.
- **Finding**: `FlashCodeUtilsZxing.java:55` is `::remove file when __MIT__`; the oracle jar encodes a real 29x29 QR.
- **Impact**: needs a ruling (DIVERGENCES.md entry), not a fix.
- **Confidence**: High
