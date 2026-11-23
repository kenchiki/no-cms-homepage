import { ArticleMarkdown } from './article-markdown.ts';
import type { FilteredBuildHashes } from './filtered-build-hashes.ts';
import type { RemovedPathsProvider } from './infrastructure/file-remover.ts';
import { listPaths } from './infrastructure/files.ts';

export class ArticleMarkdownManager implements RemovedPathsProvider {
  static readonly sourceDirectory = 'articles';
  static readonly sourceExtension = '.md';
  readonly #sourcePaths = listPaths(ArticleMarkdownManager.sourceDirectory, ArticleMarkdownManager.sourceExtension);
  readonly #previousHashes: FilteredBuildHashes;

  constructor(previousHashes: FilteredBuildHashes) {
    this.#previousHashes = previousHashes;
  }

  createMarkdowns(): ArticleMarkdown[] {
    return this.#sourcePaths.map((sourcePath) => new ArticleMarkdown({
      sourcePath,
      previousHash: this.#previousHashes.get(sourcePath),
    }));
  }

  removedPaths(): string[] {
    return this.#previousHashes.differencePaths(this.#sourcePaths)
      .map(ArticleMarkdown.outputPath);
  }
}
