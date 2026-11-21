import { describe, expect, it } from 'vitest';
import {
  applyCommandLabelOnColumn,
  COMMAND_LABEL_ON_COLUMN_RE,
  CommandLabelOnColumn,
} from '../../../../src/diagrams/gantt/command/CommandLabelOnColumn.js';
import { newGantt } from '../helpers/gantt-diagram-fixture.js';

const CMD = 'src/main/java/net/sourceforge/plantuml/gantt/command/CommandLabelOnColumn.java';

describe('CommandLabelOnColumn', () => {
  // Corpus forms.
  it.each([
    'Labels on first column and right aligned',
    'Labels on last column',
    'Labels on first column',
    'label on last column and left aligned',
    'labels on firstcolumn',
  ])(`matches %s (${CMD}:57-73)`, (line) => {
    expect(COMMAND_LABEL_ON_COLUMN_RE.test(line)).toBe(true);
  });

  it.each([
    'labels on middle column',
    'labels first column',
    'labels on first column and centre aligned',
    'labels on first column and right',
    'labels on first column trailing',
    'label on first',
    'labelson first column',
  ])(`rejects %j (${CMD}:62,69,73)`, (line) => {
    expect(COMMAND_LABEL_ON_COLUMN_RE.test(line)).toBe(false);
  });

  it('captures POSITION and ALIGNED (CommandLabelOnColumn.java:62,69)', () => {
    const g = COMMAND_LABEL_ON_COLUMN_RE.exec('Labels on first column and right aligned')?.groups;
    expect(g?.['POSITION']).toBe('first');
    expect(g?.['ALIGNED']).toBe('right');
    expect(COMMAND_LABEL_ON_COLUMN_RE.exec('Labels on last column')?.groups?.['ALIGNED']).toBeUndefined();
  });

  it.each([
    ['Labels on last column', 'last'],
    ['labels on First column and right aligned', 'First'],
  ])(
    'apply only warns that %j is ignored, naming POSITION as written (CommandLabelOnColumn.java:91-93)',
    (line, pos) => {
      const d = newGantt();
      const m = COMMAND_LABEL_ON_COLUMN_RE.exec(line)!;
      expect(applyCommandLabelOnColumn(d, m).isOk()).toBe(true);
      expect(d.getWarnings().map((w) => w.getMessage())).toEqual([
        [`'labels on ${pos} column' is no longer supported: this line is ignored`],
      ]);
    },
  );

  it('exports { regex, apply } under the Java class name', () => {
    expect(CommandLabelOnColumn.regex).toBe(COMMAND_LABEL_ON_COLUMN_RE);
    expect(CommandLabelOnColumn.apply).toBe(applyCommandLabelOnColumn);
  });
});
