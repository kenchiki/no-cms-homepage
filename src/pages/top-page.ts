import type { ArticleMarkdownList } from '../article-markdown-list.ts';
import type { TopTemplate } from '../templates/top-template.ts';
import { Page } from './page.ts';
import { renderArticles } from './render-articles.ts';

export class TopPage extends Page {
  readonly outputPath = 'docs/index.html';
  #template: TopTemplate;
  #articleMarkdownList: ArticleMarkdownList;

  constructor({ template, articleMarkdownList }: {
    template: TopTemplate;
    articleMarkdownList: ArticleMarkdownList;
  }) {
    super({ changeCheckList: [template, articleMarkdownList] });
    this.#template = template;
    this.#articleMarkdownList = articleMarkdownList;
  }

  render(): string {
    return this.#template.render({ latestArticles: renderArticles(this.#articleMarkdownList.articles) });
  }
}
