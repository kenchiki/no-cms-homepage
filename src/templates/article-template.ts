import type { LayoutTemplate } from './layout-template.ts';
import { Template } from './template.ts';

type ArticleValues = { articleTitle: string; publishedDate: string; articleBody: string };

export class ArticleTemplate extends Template<ArticleValues> {
  static readonly sourcePath = 'templates/article.html';
  #layoutTemplate: LayoutTemplate;

  constructor({ layoutTemplate, previousHash }: { layoutTemplate: LayoutTemplate; previousHash?: string }) {
    super({ sourcePath: ArticleTemplate.sourcePath, previousHash });
    this.#layoutTemplate = layoutTemplate;
  }

  render(values: ArticleValues): string {
    const body = this.replacePlaceholders(values, this.text);
    return this.#layoutTemplate.render({ title: values.articleTitle, body });
  }
}
