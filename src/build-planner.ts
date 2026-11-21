import { ArticleMarkdownList } from './article-markdown-list.ts';
import { ArticleMarkdownManager } from './article-markdown-manager.ts';
import type { BuildHashesStore } from './build-hashes-store.ts';
import { DirectoryFilePaths } from './directory-file-paths.ts';
import type { HashTracker } from './hash-tracker.ts';
import { ArchivePage } from './pages/archive-page.ts';
import { ArticlePage } from './pages/article-page.ts';
import { FixedPageManager } from './pages/fixed-page-manager.ts';
import type { Page } from './pages/page.ts';
import { TopPage } from './pages/top-page.ts';
import { ArchiveTemplate } from './templates/archive-template.ts';
import { ArticleTemplate } from './templates/article-template.ts';
import { LayoutTemplate } from './templates/layout-template.ts';
import { TopTemplate } from './templates/top-template.ts';

export type BuildPlan = {
  hashTrackers: readonly HashTracker[];
  layoutChanged: boolean;
  removedOutputPaths: string[];
  currentPages: Page[];
};

export class BuildPlanner {
  readonly #hashStore: BuildHashesStore;

  constructor(hashStore: BuildHashesStore) {
    this.#hashStore = hashStore;
  }

  create(): BuildPlan {
    const hashStore = this.#hashStore;
    const layoutTemplate = new LayoutTemplate({ previousHash: hashStore.get(LayoutTemplate.sourcePath) });
    const topTemplate = new TopTemplate({ layoutTemplate, previousHash: hashStore.get(TopTemplate.sourcePath) });
    const archiveTemplate = new ArchiveTemplate({ layoutTemplate, previousHash: hashStore.get(ArchiveTemplate.sourcePath) });
    const articleTemplate = new ArticleTemplate({ layoutTemplate, previousHash: hashStore.get(ArticleTemplate.sourcePath) });
    const previousSourcePaths = hashStore.paths;
    const previousArticleSourcePaths = new DirectoryFilePaths({
      directory: ArticleMarkdownManager.sourceDirectory,
      extension: ArticleMarkdownManager.sourceExtension,
      paths: previousSourcePaths,
    });
    const articleMarkdownManager = new ArticleMarkdownManager(previousArticleSourcePaths);
    const articleMarkdownList = new ArticleMarkdownList({
      articleMarkdowns: articleMarkdownManager.createArticleMarkdowns(hashStore),
      previousSourcePaths: previousArticleSourcePaths.paths,
    });
    const previousFixedPageSourcePaths = new DirectoryFilePaths({
      directory: FixedPageManager.sourceDirectory,
      extension: FixedPageManager.sourceExtension,
      paths: previousSourcePaths,
    });
    const fixedPageManager = new FixedPageManager(previousFixedPageSourcePaths);
    const fixedPages = fixedPageManager.createPages({ layoutTemplate, hashStore });

    return {
      hashTrackers: [
        topTemplate, archiveTemplate, articleTemplate, layoutTemplate, ...articleMarkdownList.articles, ...fixedPages,
      ],
      layoutChanged: layoutTemplate.hasChanges(),
      removedOutputPaths: [
        ...articleMarkdownManager.removedOutputPaths(),
        ...fixedPageManager.removedOutputPaths(),
      ],
      currentPages: [
        new TopPage({ template: topTemplate, articleMarkdownList: articleMarkdownList.latest() }),
        new ArchivePage({ template: archiveTemplate, articleMarkdownList }),
        ...articleMarkdownList.articles.map((articleMarkdown) => new ArticlePage({
          template: articleTemplate,
          articleMarkdown,
        })),
        ...fixedPages,
      ],
    };
  }
}
