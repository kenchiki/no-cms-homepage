import type { LayoutTemplate } from './layout-template.ts';
import { Template } from './template.ts';

type ArticleValues = {
  articleTitle: string;
  publishedDate: string;
  articleBody: string;
  urlPath: string;
  thumbnailPath: string;
};

export class ArticleTemplate extends Template<ArticleValues> {
  static readonly sourcePath = 'templates/article.html';
  #layoutTemplate: LayoutTemplate;

  constructor({ layoutTemplate, previousHash }: { layoutTemplate: LayoutTemplate; previousHash?: string }) {
    super({ sourcePath: ArticleTemplate.sourcePath, previousHash });
    this.#layoutTemplate = layoutTemplate;
  }

  render(values: ArticleValues): string {
    const { urlPath, thumbnailPath, ...content } = values;
    return this.#layoutTemplate.render({
      title: content.articleTitle,
      body: this.replacePlaceholders(content, this.text),
      openGraph: { type: 'article', urlPath, thumbnailPath },
    });
  }
}
