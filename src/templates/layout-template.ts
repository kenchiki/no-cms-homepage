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
    const siteHeaderTitle = title === undefined
      ? `<h1>${siteTitle}</h1>`
      : `<p><a href="/index.html">${siteTitle}</a></p>`;

    return this.replacePlaceholders({
      title: title ? `${title} | ${siteTitle}` : siteTitle,
      siteHeaderTitle,
      content: body.trim(),
    }, this.text);
  }
}
