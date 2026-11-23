import { dirname, extname } from 'node:path';
import type { BuildHashesStore } from './build-hashes-store.ts';

export class FilteredBuildHashes {
  readonly #hashStore: BuildHashesStore;
  readonly #directory: string;
  readonly #extension: string;
  readonly #paths: readonly string[];

  constructor({ hashStore, directory, extension }: {
    hashStore: BuildHashesStore;
    directory: string;
    extension: string;
  }) {
    this.#hashStore = hashStore;
    this.#directory = directory;
    this.#extension = extension;
    this.#paths = hashStore.paths.filter((path) => this.#matches(path));
  }

  get paths(): readonly string[] {
    return this.#paths;
  }

  get(path: string): string | undefined {
    return this.#matches(path) ? this.#hashStore.get(path) : undefined;
  }

  differencePaths(paths: readonly string[]): string[] {
    const pathSet = new Set(paths);
    return this.#paths.filter((path) => !pathSet.has(path));
  }

  #matches(path: string): boolean {
    return dirname(path) === this.#directory && extname(path) === this.#extension;
  }
}
