import { beforeEach, describe, expect, it } from '@jest/globals';
import { readFileSync, writeFileSync } from 'node:fs';
import { PageBuilder } from '../src/pages/page-builder.ts';
import { Page } from '../src/pages/page.ts';
import { useTemporaryWorkingDirectory } from './support/temporary-working-directory.ts';

const pageHtml = '<h1>ページ</h1>';
const previousHtml = '<h1>変更前のページ</h1>';

class StubPage extends Page {
  readonly outputPath: string;

  constructor({ outputPath, changed }: { outputPath: string; changed: boolean }) {
    super({ changeCheckList: [{ hasChanges: () => changed }] });
    this.outputPath = outputPath;
  }

  protected render(): string {
    return pageHtml;
  }
}

function createStubPage({ outputPath, changed }: { outputPath: string; changed: boolean }): StubPage {
  writeFileSync(outputPath, previousHtml);
  return new StubPage({ outputPath, changed });
}

describe('PageBuilder', () => {
  useTemporaryWorkingDirectory();

  describe('build', () => {
    const outputPath = 'page.html';
    let pages: readonly Page[];
    let full: boolean;

    function build(): number {
      return new PageBuilder({ pages, full }).build();
    }

    describe('差分ビルドの場合', () => {
      beforeEach(() => {
        full = false;
      });

      it('作成したページ数を返す', () => {
        pages = [
          createStubPage({ outputPath: 'first.html', changed: true }),
          createStubPage({ outputPath: 'second.html', changed: true }),
          createStubPage({ outputPath: 'third.html', changed: false }),
        ];

        expect(build()).toBe(2);
      });

      describe('変更がある場合', () => {
        beforeEach(() => {
          pages = [new StubPage({ outputPath, changed: true })];
        });

        describe('出力先にHTMLがない場合', () => {
          it('作成する', () => {
            build();
            expect(readFileSync(outputPath, 'utf8')).toBe(pageHtml);
          });
        });

        describe('出力先にHTMLがある場合', () => {
          beforeEach(() => {
            writeFileSync(outputPath, previousHtml);
          });

          it('変更する', () => {
            expect(readFileSync(outputPath, 'utf8')).toBe(previousHtml);
            build();
            expect(readFileSync(outputPath, 'utf8')).toBe(pageHtml);
          });
        });
      });

      describe('変更がない場合', () => {
        beforeEach(() => {
          pages = [new StubPage({ outputPath, changed: false })];
        });

        describe('出力先にHTMLがない場合', () => {
          it('作成する', () => {
            build();
            expect(readFileSync(outputPath, 'utf8')).toBe(pageHtml);
          });
        });

        describe('出力先にHTMLがある場合', () => {
          beforeEach(() => {
            writeFileSync(outputPath, previousHtml);
          });

          it('変更しない', () => {
            build();
            expect(readFileSync(outputPath, 'utf8')).toBe(previousHtml);
          });
        });
      });
    });

    describe('フルビルドの場合', () => {
      beforeEach(() => {
        full = true;
      });

      describe('出力先にHTMLがあり、変更がない場合', () => {
        beforeEach(() => {
          writeFileSync(outputPath, previousHtml);
          pages = [new StubPage({ outputPath, changed: false })];
        });

        it('再生成する', () => {
          build();
          expect(readFileSync(outputPath, 'utf8')).toBe(pageHtml);
        });
      });
    });
  });
});
