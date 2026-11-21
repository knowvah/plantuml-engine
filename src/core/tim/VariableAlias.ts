/**
 * A variable written with or without its leading dollar is the same variable:
 * `!foo = 1` and `!$foo = 2` set one variable, which keeps the spelling it was
 * created with. The text replacement still only knows that spelling, so a
 * `<$dummy>` sprite is not replaced because a `!define dummy` exists.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/VariableAlias.java (upstream 9d5e0d8d0cc)
 */

/**
 * The other spelling of a variable name: `toto` gives `$toto` and `$toto` gives
 * `toto`; `undefined` when there is none.
 * @see VariableAlias.java `alias`
 */
export function alias(varname: string): string | undefined {
  if (varname.startsWith('$')) return varname.length > 1 ? varname.substring(1) : undefined;
  return varname.length > 0 ? `$${varname}` : undefined;
}

/**
 * The key under which the variable is stored in `map`: the given name if it is
 * there, else its other spelling if that one is there, else the given name.
 * @see VariableAlias.java `resolveKey`
 */
export function resolveKey(map: ReadonlyMap<string, unknown>, varname: string): string {
  if (map.has(varname)) return varname;
  const other = alias(varname);
  if (other !== undefined && map.has(other)) return other;
  return varname;
}

/** @see VariableAlias.java `get` */
export function getAliased<T>(map: ReadonlyMap<string, T>, varname: string): T | undefined {
  const result = map.get(varname);
  if (result !== undefined) return result;
  const other = alias(varname);
  return other === undefined ? undefined : map.get(other);
}
