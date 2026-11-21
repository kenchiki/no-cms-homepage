import { ArticleMarkdown } from './article-markdown.ts';
import type { BuildHashesStore } from './build-hashes-store.ts';
import type { DirectoryFilePaths } from './directory-file-paths.ts';
import { listPaths } from './infrastructure/files.ts';

export class ArticleMarkdownManager {
  static readonly sourceDirectory = 'articles';
  static readonly sourceExtension = '.md';
  readonly #sourcePaths = listPaths(ArticleMarkdownManager.sourceDirectory, ArticleMarkdownManager.sourceExtension);
  readonly #previousSourcePaths: DirectoryFilePaths;

  constructor(previousSourcePaths: DirectoryFilePaths) {
    this.#previousSourcePaths = previousSourcePaths;
  }

  createArticleMarkdowns(hashStore: BuildHashesStore): ArticleMarkdown[] {
    return this.#sourcePaths.map((sourcePath) => new ArticleMarkdown({
      sourcePath,
      previousHash: hashStore.get(sourcePath),
    }));
  }

  removedOutputPaths(): string[] {
    return this.#previousSourcePaths.removedPaths(this.#sourcePaths)
      .map(ArticleMarkdown.outputPath);
  }
}
