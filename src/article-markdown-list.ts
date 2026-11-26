import { basename } from 'node:path';
import type { ArticleMarkdown } from './article-markdown.ts';
import type { ChangeTracker } from './change-tracker.ts';

export class ArticleMarkdownList implements ChangeTracker {
  static readonly #latestLimit = 10;

  readonly articles: readonly ArticleMarkdown[];
  #previousPaths: readonly string[];

  constructor({
    articleMarkdowns,
    previousSourcePaths,
  }: {
    articleMarkdowns: readonly ArticleMarkdown[];
    previousSourcePaths: readonly string[];
  }) {
    this.articles = articleMarkdowns.toSorted((first, second) =>
      ArticleMarkdownList.#compareSourcePaths(first.sourcePath, second.sourcePath),
    );
    this.#previousPaths = previousSourcePaths.toSorted(ArticleMarkdownList.#compareSourcePaths);
  }

  latest(): ArticleMarkdownList {
    return new ArticleMarkdownList({
      articleMarkdowns: this.articles.slice(0, ArticleMarkdownList.#latestLimit),
      previousSourcePaths: this.#previousPaths.slice(0, ArticleMarkdownList.#latestLimit),
    });
  }

  hasChanges(): boolean {
    return (
      this.articles.length !== this.#previousPaths.length ||
      this.articles.some((article, index) => article.sourcePath !== this.#previousPaths[index] || article.hasChanges())
    );
  }

  static #compareSourcePaths(firstPath: string, secondPath: string): number {
    const byDate = basename(secondPath).slice(0, 10).localeCompare(basename(firstPath).slice(0, 10));
    if (byDate || firstPath === secondPath) return byDate;
    return firstPath < secondPath ? -1 : 1;
  }
}
