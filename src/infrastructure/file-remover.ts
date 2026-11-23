import { deleteFiles } from './files.ts';

export interface RemovedPathsProvider {
  removedPaths(): readonly string[];
}

export class FileRemover {
  readonly #providers: readonly RemovedPathsProvider[];

  constructor(providers: readonly RemovedPathsProvider[]) {
    this.#providers = providers;
  }

  remove(): number {
    const paths = this.#providers.flatMap((provider) => provider.removedPaths());
    return deleteFiles(paths);
  }
}
