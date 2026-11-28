import { basename } from 'node:path';
import { marked, type Token } from 'marked';
import type { ChangeTracker } from './change-tracker.ts';
import type { HashTracker } from './hash-tracker.ts';
import { parseMetadata } from './html.ts';
import { readFile, type TextFile } from './infrastructure/files.ts';

const sourceExtension = '.md';

export class ArticleMarkdown implements ChangeTracker, HashTracker {
  readonly outputPath: string;
  readonly publishedDate: string;
  readonly title: string;
  readonly thumbnailPath: string;
  #source: TextFile;
  #bodyTokens: Token[];
  #previousHash: string | undefined;

  static outputPath(sourcePath: string): string {
    return `docs/articles/${basename(sourcePath, sourceExtension)}.html`;
  }

  constructor({ sourcePath, previousHash }: { sourcePath: string; previousHash?: string }) {
    this.#source = readFile(sourcePath);
    this.#previousHash = previousHash;
    this.outputPath = ArticleMarkdown.outputPath(sourcePath);
    this.publishedDate = this.#parsePublishedDate(basename(sourcePath, sourceExtension));

    const metadata = parseMetadata(this.#source.text);
    const { title, bodyTokens } = this.#parseMarkdown();
    this.title = title;
    this.thumbnailPath = metadata.get('thumbnail') || '/assets/images/site/no_image.png';
    this.#bodyTokens = bodyTokens;
  }

  get sourcePath(): string {
    return this.#source.path;
  }

  get urlPath(): string {
    return `/articles/${encodeURIComponent(basename(this.outputPath))}`;
  }

  get hash(): string {
    return this.#source.hash;
  }

  hasChanges(): boolean {
    return this.hash !== this.#previousHash;
  }

  render(): string {
    return marked.parser(this.#bodyTokens).trim();
  }

  #parsePublishedDate(filename: string): string {
    const publishedDate = /^(\d{4}-\d{2}-\d{2})-.+$/.exec(filename)?.[1];
    const date = new Date(`${publishedDate}T00:00:00Z`);
    if (!publishedDate || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== publishedDate) {
      throw new Error(`${this.sourcePath} のファイル名に有効な公開日を指定してください（YYYY-MM-DD-記事名.md）。`);
    }
    return publishedDate;
  }

  #parseMarkdown(): { title: string; bodyTokens: Token[] } {
    const bodyTokens = marked.lexer(this.#source.text);
    const headingIndex = bodyTokens.findIndex((token) => token.type === 'heading' && token.depth === 1);
    const heading = bodyTokens[headingIndex];
    const title = heading?.type === 'heading' && heading.tokens ? this.#headingText(heading.tokens).trim() : '';
    if (!title) throw new Error(`${this.sourcePath} に記事タイトルとなる H1 を指定してください。`);
    bodyTokens.splice(headingIndex, 1);
    return { title, bodyTokens };
  }

  #headingText(tokens: Token[]): string {
    return tokens
      .map((token) => {
        if (token.type === 'html') return '';
        if (token.type === 'br') return ' ';
        if (token.type === 'codespan' || (token.type === 'link' && token.autolink)) {
          return token.text;
        }
        if ('tokens' in token && Array.isArray(token.tokens)) {
          return this.#headingText(token.tokens);
        }
        return 'text' in token && typeof token.text === 'string' ? token.text : '';
      })
      .join('');
  }
}
