import type { ArticleMarkdown } from '../article-markdown.ts';
import { escapeHtml } from '../html.ts';

export function renderArticles(articles: readonly ArticleMarkdown[]): string {
  if (articles.length === 0) return '<p>記事はまだありません。</p>';
  return `<ul class="posts">\n${articles.map(renderCard).join('\n')}\n</ul>`;
}

function renderCard({ urlPath, publishedDate, title, thumbnailPath }: ArticleMarkdown): string {
  const time = `<time datetime="${publishedDate}">${publishedDate}</time>`;
  return `  <li>
    <a href="${urlPath}">
      <span class="posts__thumb"><img src="${thumbnailPath}" alt="" loading="lazy"></span>
      <span class="posts__date">${time}</span>
      <span class="posts__title">${escapeHtml(title)}</span>
    </a>
  </li>`;
}
