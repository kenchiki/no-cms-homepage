import { beforeEach, describe, expect, it } from '@jest/globals';
import { appendFileSync, existsSync, readFileSync, statSync, utimesSync } from 'node:fs';
import { Publisher } from '../src/publisher.ts';
import { createArticleMarkdown, deleteArticleMarkdown } from './support/article-markdown.ts';
import { createFixedPageHtml, deleteFixedPageHtml } from './support/fixed-page-html.ts';
import { useSiteDirectories } from './support/site-directories.ts';
import { useSiteTemplates } from './support/site-templates.ts';
import { useTemporaryWorkingDirectory } from './support/temporary-working-directory.ts';

describe('Publisher', () => {
  useTemporaryWorkingDirectory();
  useSiteDirectories();
  useSiteTemplates();

  describe('publish', () => {
    let full: boolean;

    function publish(options = { full }) {
      return new Publisher().publish(options.full);
    }

    describe('差分ビルドの場合', () => {
      beforeEach(() => {
        full = false;
      });

      describe('記事ページ', () => {
        it('作成する', () => {
          const fileName = '2026-11-18-second';
          const title = '新しい記事';
          createArticleMarkdown({ fileName, title, body: '新しい本文です。' });

          publish();

          expect(readFileSync(`docs/articles/${fileName}.html`, 'utf8')).toContain(`<h1>${title}</h1>`);
        });

        it('削除する', () => {
          const fileName = '2026-11-18-second';
          const outputPath = `docs/articles/${fileName}.html`
          createArticleMarkdown({ fileName, title: '新しい記事', body: '新しい本文です。' });
          publish();

          expect(existsSync(outputPath)).toBe(true);
          deleteArticleMarkdown({ fileName });
          publish();
          expect(existsSync(outputPath)).toBe(false);
        });
      });

      describe('固定ページ', () => {
        it('作成する', () => {
          const fileName = 'links';
          const body = '<h1>リンク</h1>';
          createFixedPageHtml({ fileName, title: 'リンク', body });

          publish();

          expect(readFileSync(`docs/pages/${fileName}.html`, 'utf8')).toContain(body);
        });

        it('削除する', () => {
          const fileName = 'links';
          const outputPath = `docs/pages/${fileName}.html`;
          createFixedPageHtml({ fileName, title: 'リンク', body: '<h1>リンク</h1>' });
          publish();

          expect(existsSync(outputPath)).toBe(true);
          deleteFixedPageHtml({ fileName });
          publish();
          expect(existsSync(outputPath)).toBe(false);
        });
      });

      describe('トップページ', () => {
        beforeEach(() => {
          publish();
        });

        it('変更する', () => {
          const addedMarkup = '<p>トップページの追記</p>';
          appendFileSync('templates/index.html', `\n${addedMarkup}\n`);

          publish();

          expect(readFileSync('docs/index.html', 'utf8')).toContain(addedMarkup);
        });
      });

      describe('アーカイブページ', () => {
        beforeEach(() => {
          publish();
        });

        it('変更する', () => {
          const addedMarkup = '<p>アーカイブページの追記</p>';
          appendFileSync('templates/archive.html', `\n${addedMarkup}\n`);

          publish();

          expect(readFileSync('docs/archive.html', 'utf8')).toContain(addedMarkup);
        });
      });

      describe('ページに変更がない場合', () => {
        beforeEach(() => {
          publish();
        });

        it('変更しない', () => {
          expect(publish()).toEqual({ generated: 0, deleted: 0 });
        });
      });
    });

    describe('フルビルドの場合', () => {
      const articleFileName = '2026-11-17-first';
      const outputPaths = [
        'docs/index.html',
        'docs/archive.html',
        `docs/articles/${articleFileName}.html`,
        'docs/pages/gallery.html',
      ];
      const previousModifiedAt = new Date('2000-01-01T00:00:00Z');

      beforeEach(() => {
        full = true;

        createArticleMarkdown({ fileName: articleFileName, title: '最初の記事', body: '記事の本文です。' });
        createFixedPageHtml({ fileName: 'gallery', title: 'ギャラリー', body: '<h1>ギャラリー</h1>' });
        publish({ full: false });
        for (const path of outputPaths) utimesSync(path, previousModifiedAt, previousModifiedAt);
      });

      it('入力に変更がなくても全ページを再生成する', () => {
        expect(publish()).toEqual({ generated: outputPaths.length, deleted: 0 });

        const modifiedPaths = outputPaths.filter((path) => statSync(path).mtimeMs !== previousModifiedAt.getTime());
        expect(modifiedPaths).toEqual(outputPaths);
      });
    });
  });
});
