import type { ChangeTracker } from '../change-tracker.ts';
import type { HashTracker } from '../hash-tracker.ts';
import { readFile } from '../infrastructure/files.ts';

export abstract class Template<Values> implements ChangeTracker, HashTracker {
  readonly sourcePath: string;
  readonly hash: string;
  protected readonly text: string;
  #previousHash: string | undefined;

  constructor({ sourcePath, previousHash }: { sourcePath: string; previousHash?: string }) {
    const source = readFile(sourcePath);
    this.sourcePath = source.path;
    this.hash = source.hash;
    this.text = source.text;
    this.#previousHash = previousHash;
  }

  hasChanges(): boolean {
    return this.hash !== this.#previousHash;
  }

  abstract render(values: Values): string;

  protected replacePlaceholders(values: Record<string, string>, text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) =>
      Object.hasOwn(values, name) ? values[name] : placeholder,
    );
  }
}
