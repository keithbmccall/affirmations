export class Cache<T> {
  private snapshot: T | null = null;
  private readonly subscribers = new Set<() => void>();

  constructor(private readonly emptySnapshot: T) {}

  /** Returns the current snapshot or the shared empty default — do not mutate. */
  get(): T {
    return this.snapshot ?? this.emptySnapshot;
  }

  set(snapshot: T): void {
    if (snapshot === this.snapshot) {
      return;
    }
    this.snapshot = snapshot;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  reset(): void {
    if (this.snapshot === null) {
      return;
    }
    this.snapshot = null;
    this.notify();
  }

  private notify(): void {
    this.subscribers.forEach(listener => {
      listener();
    });
  }
}
