import { dirname, extname } from 'node:path';

export class FilteredPaths {
  readonly #paths: readonly string[];

  constructor({ directory, extension, paths }: {
    directory: string;
    extension: string;
    paths: readonly string[];
  }) {
    this.#paths = paths.filter((path) => dirname(path) === directory && extname(path) === extension);
  }

  get paths(): readonly string[] {
    return this.#paths;
  }

  difference(paths: readonly string[]): string[] {
    const pathSet = new Set(paths);
    return this.#paths.filter((path) => !pathSet.has(path));
  }
}
