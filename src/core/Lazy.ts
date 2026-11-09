/**
 * `Lazy<T>`: a value computed on first `get()` and kept. Upstream's holds a `Supplier`; a pattern compiled at
 * class-load time would cost every diagram, so the multi-line commands pass their end pattern through it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/Lazy.java
 */
export class Lazy<T> {
  private readonly supplier: () => T;
  private value: T | undefined = undefined;
  private done = false;

  constructor(supplier: () => T) {
    this.supplier = supplier;
  }

  get(): T {
    if (!this.done) {
      this.value = this.supplier();
      this.done = true;
    }
    return this.value as T;
  }
}
