import { deleteFiles } from './files.ts';

export class FileRemover {
  readonly #paths: readonly string[];

  constructor(paths: readonly string[]) {
    this.#paths = paths;
  }

  remove(): number {
    return deleteFiles(this.#paths);
  }
}
