import { Template } from './template.ts';

type LayoutValues = {
  title?: string;
  body: string;
};

export class LayoutTemplate extends Template<LayoutValues> {
  static readonly sourcePath = 'templates/layout.html';
  static readonly #siteTitle = 'no-cms-homepage';

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
    if (title === undefined) {
      return `<h1>${LayoutTemplate.#siteTitle}</h1>`;
    }
    return `<p><a href="/index.html">${LayoutTemplate.#siteTitle}</a></p>`;
  }
}
