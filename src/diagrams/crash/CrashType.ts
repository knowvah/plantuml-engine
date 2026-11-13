/**
 * `CrashType` — the phase a `crash when …` line crashes in.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashType.java
 */
export const CrashType = {
  PARSING: 'PARSING',
  FINALIZING: 'FINALIZING',
  DRAWING: 'DRAWING',
} as const;

export type CrashType = (typeof CrashType)[keyof typeof CrashType];

/**
 * `CrashType.valueOf(name)`: `IllegalArgumentException` for any other name.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashType.java:38-42
 */
export function valueOf(name: string): CrashType {
  const type = Object.values(CrashType).find((t) => t === name);
  if (type === undefined)
    throw new Error(
      `java.lang.IllegalArgumentException: No enum constant net.sourceforge.plantuml.crash.CrashType.${name}`,
    );
  return type;
}
