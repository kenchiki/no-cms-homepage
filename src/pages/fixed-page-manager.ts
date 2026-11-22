import type { BuildHashesStore } from '../build-hashes-store.ts';
import type { FilteredPaths } from '../filtered-paths.ts';
import { listPaths } from '../infrastructure/files.ts';
import type { LayoutTemplate } from '../templates/layout-template.ts';
import { FixedPage } from './fixed-page.ts';

export class FixedPageManager {
  static readonly sourceDirectory = 'pages';
  static readonly sourceExtension = '.html';
  readonly #sourcePaths = listPaths(FixedPageManager.sourceDirectory, FixedPageManager.sourceExtension);
  readonly #previousSourcePaths: FilteredPaths;

  constructor(previousSourcePaths: FilteredPaths) {
    this.#previousSourcePaths = previousSourcePaths;
  }

  createPages({ layoutTemplate, hashStore }: { layoutTemplate: LayoutTemplate; hashStore: BuildHashesStore }): FixedPage[] {
    return this.#sourcePaths.map((sourcePath) => new FixedPage({
      layoutTemplate,
      sourcePath,
      previousHash: hashStore.get(sourcePath),
    }));
  }

  removedPaths(): string[] {
    return this.#previousSourcePaths.difference(this.#sourcePaths)
      .map(FixedPage.outputPath);
  }
}
