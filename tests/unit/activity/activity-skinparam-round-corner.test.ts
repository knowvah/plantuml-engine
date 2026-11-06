/**
 * `skinparam roundCorner N` reaches the activity box (smc T4c). Jar values: `scripts/oracle-render.sh` on the same
 * source (`<rect ... rx="4" ry="4"/>`) and `activity__casc-control-theme.svg` (`rx="4.167"` at dpi 100).
 *
 * Upstream: `addConvert("roundCorner", PName.RoundCorner, SName.root)` (`FromSkinparamToStyle.java:164`) folds into the
 * builder as it executes (`SkinParam.java:227-234`); `FtileBox` reads `style.value(PName.RoundCorner)` off the merged
 * `activity` style (`FtileBox.java:171`), where the later root value beats `plantuml.skin:362`'s 25 by counter.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';

const BOX_RX = /<rect [^>]*rx="([\d.]+)"/;

function boxRx(source: string): string | undefined {
  const out = renderSync(source);
  const svg = out;
  return BOX_RX.exec(svg)?.[1];
}

describe('activity box round corner', () => {
  it('reads a bare skinparam roundCorner (rx = 8 / 2)', () => {
    expect(boxRx('@startuml\nskinparam roundcorner 8\nstart\n:a;\nstop\n@enduml\n')).toBe('4');
  });

  it('reads it with a <style> block present', () => {
    const src =
      '@startuml\nskinparam roundcorner 8\n<style>\nnote { FontSize 12 }\n</style>\nstart\n:a;\nstop\n@enduml\n';
    expect(boxRx(src)).toBe('4');
  });

  it('keeps 25 when no roundCorner is declared (rx 12.5)', () => {
    expect(boxRx('@startuml\nstart\n:a;\nstop\n@enduml\n')).toBe('12.5');
  });

  it('an activity { RoundCorner } style value beats the skinparam declared before it', () => {
    const src =
      '@startuml\nskinparam roundcorner 8\n<style>\nactivity { RoundCorner 20 }\n</style>\nstart\n:a;\nstop\n@enduml\n';
    expect(boxRx(src)).toBe('10');
  });
});

describe('activity arrow thickness', () => {
  const LINE = /<line [^>]*stroke-width="([\d.]+)"/;
  const lineWidth = (source: string): string | undefined => {
    const out = renderSync(source);
    return LINE.exec(out)?.[1];
  };

  it('reads skinparam arrowThickness (jar: stroke-width:3)', () => {
    expect(lineWidth('@startuml\nskinparam arrowThickness 3\nstart\n:a;\nstop\n@enduml\n')).toBe('3');
  });

  it('keeps 1 when none is declared', () => {
    expect(lineWidth('@startuml\nstart\n:a;\nstop\n@enduml\n')).toBe('1');
  });
});
