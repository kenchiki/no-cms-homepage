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
        describe('マークダウンがある場合', () => {
          const fileName = '2026-11-18-second';
          const title = '新しい記事';
          const body = '新しい本文です。';

          beforeEach(() => {
            publish();
            createArticleMarkdown({ fileName, title, body });
          });

          it('作成する', () => {
            publish();
            expect(readFileSync(`docs/articles/${fileName}.html`, 'utf8')).toContain(body);
          });
        });

        describe('マークダウンが削除された場合', () => {
          const fileName = '2026-11-18-second';
          const outputPath = `docs/articles/${fileName}.html`;

          beforeEach(() => {
            createArticleMarkdown({ fileName, title: '新しい記事', body: '新しい本文です。' });
            publish();
            deleteArticleMarkdown({ fileName });
          });

          it('削除する', () => {
            expect(existsSync(outputPath)).toBe(true);
            publish();
            expect(existsSync(outputPath)).toBe(false);
          });
        });
      });

      describe('固定ページ', () => {
        describe('htmlがある場合', () => {
          const fileName = 'links';
          const body = '<h1>リンク</h1>';

          beforeEach(() => {
            publish();
            createFixedPageHtml({ fileName, title: 'リンク', body });
          });

          it('作成する', () => {
            publish();
            expect(readFileSync(`docs/pages/${fileName}.html`, 'utf8')).toContain(body);
          });
        });

        describe('htmlが削除された場合', () => {
          const fileName = 'links';
          const outputPath = `docs/pages/${fileName}.html`;

          beforeEach(() => {
            createFixedPageHtml({ fileName, title: 'リンク', body: '<h1>リンク</h1>' });
            publish();
            deleteFixedPageHtml({ fileName });
          });

          it('削除する', () => {
            expect(existsSync(outputPath)).toBe(true);
            publish();
            expect(existsSync(outputPath)).toBe(false);
          });
        });
      });

      describe('トップページ', () => {
        describe('テンプレートに変更があった場合', () => {
          const addedMarkup = '<p>トップページの追記</p>';

          beforeEach(() => {
            publish();
            appendFileSync('templates/index.html', `\n${addedMarkup}\n`);
          });

          it('変更する', () => {
            publish();
            expect(readFileSync('docs/index.html', 'utf8')).toContain(addedMarkup);
          });
        });
      });

      describe('アーカイブページ', () => {
        describe('テンプレートに変更があった場合', () => {
          const addedMarkup = '<p>アーカイブページの追記</p>';

          beforeEach(() => {
            publish();
            appendFileSync('templates/archive.html', `\n${addedMarkup}\n`);
          });

          it('変更する', () => {
            publish();
            expect(readFileSync('docs/archive.html', 'utf8')).toContain(addedMarkup);
          });
        });
      });

      describe('マークダウン・html・テンプレートに変更がない場合', () => {
        beforeEach(() => {
          publish();
        });

        it('変更しない', () => {
          expect(publish()).toEqual({ generated: 0, deleted: 0 });
        });
      });
    });

    describe('フルビルドの場合', () => {
      beforeEach(() => {
        full = true;
      });

      describe('マークダウン・html・テンプレートに変更がない場合', () => {
        const articleFileName = '2026-11-17-first';
        const outputPaths = [
          'docs/index.html',
          'docs/archive.html',
          `docs/articles/${articleFileName}.html`,
          'docs/pages/gallery.html',
        ];
        const previousModifiedAt = new Date('2000-01-01T00:00:00Z');

        beforeEach(() => {
          createArticleMarkdown({ fileName: articleFileName, title: '最初の記事', body: '記事の本文です。' });
          createFixedPageHtml({ fileName: 'gallery', title: 'ギャラリー', body: '<h1>ギャラリー</h1>' });
          publish({ full: false });
          for (const path of outputPaths) utimesSync(path, previousModifiedAt, previousModifiedAt);
        });

        it('全ページを再生成する', () => {
          expect(publish()).toEqual({ generated: outputPaths.length, deleted: 0 });

          const modifiedPaths = outputPaths.filter((path) => statSync(path).mtimeMs !== previousModifiedAt.getTime());
          expect(modifiedPaths).toEqual(outputPaths);
        });
      });
    });
  });
});
