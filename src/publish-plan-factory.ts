import { ArticleMarkdownList } from './article-markdown-list.ts';
import { ArticleMarkdownManager } from './article-markdown-manager.ts';
import type { BuildHashesStore } from './build-hashes-store.ts';
import { FilteredPaths } from './filtered-paths.ts';
import type { HashTracker } from './hash-tracker.ts';
import { FileRemover } from './infrastructure/file-remover.ts';
import { ArchivePage } from './pages/archive-page.ts';
import { ArticlePage } from './pages/article-page.ts';
import { FixedPageManager } from './pages/fixed-page-manager.ts';
import { PageBuilder } from './pages/page-builder.ts';
import { TopPage } from './pages/top-page.ts';
import { ArchiveTemplate } from './templates/archive-template.ts';
import { ArticleTemplate } from './templates/article-template.ts';
import { LayoutTemplate } from './templates/layout-template.ts';
import { TopTemplate } from './templates/top-template.ts';

export type PublishPlan = {
  hashTrackers: readonly HashTracker[];
  fileRemover: FileRemover;
  pageBuilder: PageBuilder;
};

export class PublishPlanFactory {
  readonly #hashStore: BuildHashesStore;

  constructor(hashStore: BuildHashesStore) {
    this.#hashStore = hashStore;
  }

  create(full: boolean): PublishPlan {
    const hashStore = this.#hashStore;
    const layoutTemplate = new LayoutTemplate({ previousHash: hashStore.get(LayoutTemplate.sourcePath) });
    const topTemplate = new TopTemplate({ layoutTemplate, previousHash: hashStore.get(TopTemplate.sourcePath) });
    const archiveTemplate = new ArchiveTemplate({ layoutTemplate, previousHash: hashStore.get(ArchiveTemplate.sourcePath) });
    const articleTemplate = new ArticleTemplate({ layoutTemplate, previousHash: hashStore.get(ArticleTemplate.sourcePath) });
    const previousSourcePaths = hashStore.paths;
    const previousArticleSourcePaths = new FilteredPaths({
      directory: ArticleMarkdownManager.sourceDirectory,
      extension: ArticleMarkdownManager.sourceExtension,
      paths: previousSourcePaths,
    });
    const articleMarkdownManager = new ArticleMarkdownManager(previousArticleSourcePaths);
    const articleMarkdownList = new ArticleMarkdownList({
      articleMarkdowns: articleMarkdownManager.createArticleMarkdowns(hashStore),
      previousSourcePaths: previousArticleSourcePaths.paths,
    });
    const previousFixedPageSourcePaths = new FilteredPaths({
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
      fileRemover: new FileRemover([
        ...articleMarkdownManager.removedPaths(),
        ...fixedPageManager.removedPaths(),
      ]),
      pageBuilder: new PageBuilder({
        full: full || layoutTemplate.hasChanges(),
        pages: [
          new TopPage({ template: topTemplate, articleMarkdownList: articleMarkdownList.latest() }),
          new ArchivePage({ template: archiveTemplate, articleMarkdownList }),
          ...articleMarkdownList.articles.map((articleMarkdown) => new ArticlePage({
            template: articleTemplate,
            articleMarkdown,
          })),
          ...fixedPages,
        ],
      }),
    };
  }
}
