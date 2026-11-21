import { basename } from 'node:path';
import type { ArticleMarkdown } from '../article-markdown.ts';

export function renderArticles(articles: readonly ArticleMarkdown[]): string {
  if (articles.length === 0) return '<p>記事はまだありません。</p>';
  const items = articles.map(({ outputPath, publishedDate, title }) => {
    const href = `/articles/${encodeURIComponent(basename(outputPath))}`;
    return `  <li><time datetime="${publishedDate}">${publishedDate}</time> <a href="${href}">${title}</a></li>`;
  });
  return `<ul>\n${items.join('\n')}\n</ul>`;
}
