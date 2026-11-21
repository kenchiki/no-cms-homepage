import { dirname, extname } from 'node:path';

export class DirectoryFilePaths {
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

  removedPaths(currentPaths: readonly string[]): string[] {
    const currentPathSet = new Set(currentPaths);
    return this.#paths.filter((path) => !currentPathSet.has(path));
  }
}
