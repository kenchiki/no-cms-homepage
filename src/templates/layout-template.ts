import { Template } from './template.ts';

type LayoutValues = {
  title?: string;
  body: string;
};

export class LayoutTemplate extends Template<LayoutValues> {
  static readonly sourcePath = 'templates/layout.html';
  static readonly #siteTitle = 'FUU BLOG.';

  constructor({ previousHash }: { previousHash?: string }) {
    super({ sourcePath: LayoutTemplate.sourcePath, previousHash });
  }

  render({ title, body }: LayoutValues): string {
    const siteTitle = LayoutTemplate.#siteTitle;

    return this.replacePlaceholders(
      {
        title: title ? `${title} | ${siteTitle}` : siteTitle,
        siteHeaderTitle: this.#renderSiteHeaderTitle(title),
        content: body.trim(),
      },
      this.text,
    );
  }

  #renderSiteHeaderTitle(title: string | undefined): string {
    const logo = `<img src="/assets/images/site/logo.png" width="360" height="50" alt="${LayoutTemplate.#siteTitle}">`;
    if (title === undefined) {
      return `<h1 class="header__logo">${logo}</h1>`;
    }
    return `<p class="header__logo"><a href="/index.html">${logo}</a></p>`;
  }
}
