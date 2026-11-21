import { readFileSync } from 'node:fs';
import { writeFile } from './infrastructure/files.ts';

type Hashes = Readonly<Record<string, string>>;

export class BuildHashesStore {
  static readonly #statePath = 'build-hashes.json';
  #hashes: Hashes;

  constructor() {
    this.#hashes = this.#readJson(BuildHashesStore.#statePath) ?? {};
  }

  save(hashes: Hashes): void {
    writeFile(BuildHashesStore.#statePath, this.#serialize(hashes));
    this.#hashes = hashes;
  }

  get(path: string): string | undefined {
    return Object.hasOwn(this.#hashes, path) ? this.#hashes[path] : undefined;
  }

  get paths(): string[] {
    return Object.keys(this.#hashes);
  }

  #readJson(path: string): Hashes | undefined {
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as Hashes;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
      throw new Error(`${path} を読み取れません。`, { cause: error });
    }
  }

  #serialize(value: Hashes): string {
    return `${JSON.stringify(value, null, 2)}\n`;
  }
}
