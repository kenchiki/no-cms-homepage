import { ArticleMarkdown } from './article-markdown.ts';
import type { BuildHashesStore } from './build-hashes-store.ts';
import type { FilteredPaths } from './filtered-paths.ts';
import { listPaths } from './infrastructure/files.ts';

export class ArticleMarkdownManager {
  static readonly sourceDirectory = 'articles';
  static readonly sourceExtension = '.md';
  readonly #sourcePaths = listPaths(ArticleMarkdownManager.sourceDirectory, ArticleMarkdownManager.sourceExtension);
  readonly #previousSourcePaths: FilteredPaths;

  constructor(previousSourcePaths: FilteredPaths) {
    this.#previousSourcePaths = previousSourcePaths;
  }

  createArticleMarkdowns(hashStore: BuildHashesStore): ArticleMarkdown[] {
    return this.#sourcePaths.map((sourcePath) => new ArticleMarkdown({
      sourcePath,
      previousHash: hashStore.get(sourcePath),
    }));
  }

  removedPaths(): string[] {
    return this.#previousSourcePaths.difference(this.#sourcePaths)
      .map(ArticleMarkdown.outputPath);
  }
}
