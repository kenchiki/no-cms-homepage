import type { FilteredBuildHashes } from '../filtered-build-hashes.ts';
import type { RemovedPathsProvider } from '../infrastructure/file-remover.ts';
import { listPaths } from '../infrastructure/files.ts';
import type { LayoutTemplate } from '../templates/layout-template.ts';
import { FixedPage } from './fixed-page.ts';

export class FixedPageManager implements RemovedPathsProvider {
  static readonly sourceDirectory = 'pages';
  static readonly sourceExtension = '.html';
  readonly #sourcePaths = listPaths(FixedPageManager.sourceDirectory, FixedPageManager.sourceExtension);
  readonly #previousHashes: FilteredBuildHashes;

  constructor(previousHashes: FilteredBuildHashes) {
    this.#previousHashes = previousHashes;
  }

  createPages({ layoutTemplate }: { layoutTemplate: LayoutTemplate }): FixedPage[] {
    return this.#sourcePaths.map(
      (sourcePath) =>
        new FixedPage({
          layoutTemplate,
          sourcePath,
          previousHash: this.#previousHashes.get(sourcePath),
        }),
    );
  }

  removedPaths(): string[] {
    return this.#previousHashes.differencePaths(this.#sourcePaths).map(FixedPage.outputPath);
  }
}
