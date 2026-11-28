import type { ArticleMarkdown } from '../article-markdown.ts';
import type { ArticleTemplate } from '../templates/article-template.ts';
import { Page } from './page.ts';

export class ArticlePage extends Page {
  readonly outputPath: string;
  #template: ArticleTemplate;
  #articleMarkdown: ArticleMarkdown;

  constructor({ template, articleMarkdown }: { template: ArticleTemplate; articleMarkdown: ArticleMarkdown }) {
    super({ changeCheckList: [template, articleMarkdown] });
    this.outputPath = articleMarkdown.outputPath;
    this.#template = template;
    this.#articleMarkdown = articleMarkdown;
  }

  protected render(): string {
    const { title, publishedDate, urlPath, thumbnailPath } = this.#articleMarkdown;
    return this.#template.render({
      articleTitle: title,
      publishedDate,
      articleBody: this.#articleMarkdown.render(),
      urlPath,
      thumbnailPath,
    });
  }
}
