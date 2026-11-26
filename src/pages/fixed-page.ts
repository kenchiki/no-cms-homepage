import type { HashTracker } from '../hash-tracker.ts';
import { parseHtml } from '../html.ts';
import { readFile, type TextFile } from '../infrastructure/files.ts';
import type { LayoutTemplate } from '../templates/layout-template.ts';
import { Page } from './page.ts';

export class FixedPage extends Page implements HashTracker {
  readonly outputPath: string;
  #source: TextFile;
  #layoutTemplate: LayoutTemplate;

  static outputPath(sourcePath: string): string {
    return `docs/${sourcePath}`;
  }

  constructor({
    layoutTemplate,
    sourcePath,
    previousHash,
  }: {
    layoutTemplate: LayoutTemplate;
    sourcePath: string;
    previousHash?: string;
  }) {
    const source = readFile(sourcePath);
    super({ changeCheckList: [{ hasChanges: () => source.hash !== previousHash }] });
    this.outputPath = FixedPage.outputPath(sourcePath);
    this.#source = source;
    this.#layoutTemplate = layoutTemplate;
  }

  get sourcePath(): string {
    return this.#source.path;
  }

  get hash(): string {
    return this.#source.hash;
  }

  protected render(): string {
    return this.#layoutTemplate.render(parseHtml(this.#source.text));
  }
}
