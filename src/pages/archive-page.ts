import type { ArticleMarkdownList } from '../article-markdown-list.ts';
import type { ArchiveTemplate } from '../templates/archive-template.ts';
import { Page } from './page.ts';
import { renderArticles } from './render-articles.ts';

export class ArchivePage extends Page {
  readonly outputPath = 'docs/archive.html';
  #template: ArchiveTemplate;
  #articleMarkdownList: ArticleMarkdownList;

  constructor({
    template,
    articleMarkdownList,
  }: {
    template: ArchiveTemplate;
    articleMarkdownList: ArticleMarkdownList;
  }) {
    super({ changeCheckList: [template, articleMarkdownList] });
    this.#template = template;
    this.#articleMarkdownList = articleMarkdownList;
  }

  protected render(): string {
    return this.#template.render(this.#renderSections());
  }

  #renderSections() {
    const byYear = Map.groupBy(this.#articleMarkdownList.articles, (article) => article.publishedDate.slice(0, 4));
    const years = [...byYear.keys()];
    const links = years.map((year) => `<li><a href="/archive.html#year-${year}">${year}年</a></li>`).join('\n');
    const groups = [...byYear].map(
      ([year, group]) => `<section>\n<h2 id="year-${year}">${year}年</h2>\n${renderArticles(group)}\n</section>`,
    );
    return {
      yearNavigation: links ? `<nav aria-label="年別">\n<ul>\n${links}\n</ul>\n</nav>` : '',
      articlesByYear: groups.length ? groups.join('\n') : renderArticles([]),
    };
  }
}
