import { escapeHtml } from '../html.ts';
import { Template } from './template.ts';

type OpenGraph = {
  type: 'article' | 'website';
  urlPath: string;
  thumbnailPath: string;
};

type LayoutValues = {
  title?: string;
  body: string;
  openGraph?: OpenGraph;
};

export class LayoutTemplate extends Template<LayoutValues> {
  static readonly sourcePath = 'templates/layout.html';
  static readonly #siteOrigin = 'https://fuuuchan.com';
  static readonly #siteTitle = 'FUU BLOG.';

  constructor({ previousHash }: { previousHash?: string }) {
    super({ sourcePath: LayoutTemplate.sourcePath, previousHash });
  }

  render({ title, body, openGraph }: LayoutValues): string {
    const siteTitle = LayoutTemplate.#siteTitle;

    return this.replacePlaceholders(
      {
        title: title ? `${title} | ${siteTitle}` : siteTitle,
        openGraph: openGraph ? this.#renderOpenGraph(title || siteTitle, openGraph) : '',
        siteHeaderTitle: this.#renderSiteHeaderTitle(title),
        content: body.trim(),
      },
      this.text,
    );
  }

  #renderOpenGraph(title: string, { type, urlPath, thumbnailPath }: OpenGraph): string {
    const origin = LayoutTemplate.#siteOrigin;
    return [
      `<meta property="og:type" content="${type}">`,
      `<meta property="og:title" content="${escapeHtml(title)}">`,
      `<meta property="og:url" content="${origin}${urlPath}">`,
      `<meta property="og:image" content="${origin}${thumbnailPath}">`,
    ].join('\n');
  }

  #renderSiteHeaderTitle(title: string | undefined): string {
    const logo = `<img src="/assets/images/site/logo.png" width="360" height="50" alt="${LayoutTemplate.#siteTitle}">`;
    if (title === undefined) {
      return `<h1 class="header__logo">${logo}</h1>`;
    }
    return `<p class="header__logo"><a href="/index.html">${logo}</a></p>`;
  }
}
