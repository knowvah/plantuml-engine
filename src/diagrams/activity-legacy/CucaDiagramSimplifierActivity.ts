/**
 * `CucaDiagramSimplifierActivity`: turns every autarkic group (an `INNER_ACTIVITY`, a `CONCURRENT_ACTIVITY`) into a
 * leaf. Each group is laid out on its own ({@link GroupMakerActivity}, a nested svek pass that runs `layoutGraph`
 * before the parent's), and the group becomes an `ACTIVITY` leaf whose image is that result. It repeats until no
 * group is autarkic, since overriding a group changes what `diagram.groups()` answers.
 *
 * Port-only: `GroupMakerActivity` also takes the string measurer (the nested ink walk and `note on link` merge
 * need it); `DotMode` has one value here (`NORMAL`), so it is not passed.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/CucaDiagramSimplifierActivity.java:52-68
 */
import { LeafType } from '../../core/abel/LeafType.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import { GroupMakerActivity } from './GroupMakerActivity.js';

export class CucaDiagramSimplifierActivity {
  /** @see CucaDiagramSimplifierActivity.java:52-68 */
  simplify(diagram: ActivityDiagram, stringBounder: StringBounder, measurer: StringMeasurer): void {
    let changed: boolean;
    do {
      changed = false;
      const groups = [...diagram.groups()];
      for (const g of groups)
        if (g.isAutarkic()) {
          const maker = new GroupMakerActivity(diagram, g, stringBounder, measurer);
          const img = maker.getImage();
          g.overrideImage(img, LeafType.ACTIVITY);

          changed = true;
        }
    } while (changed);
  }
}
