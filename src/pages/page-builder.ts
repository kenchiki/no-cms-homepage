import { fileExists } from '../infrastructure/files.ts';
import type { Page } from './page.ts';

export class PageBuilder {
  readonly #pages: readonly Page[];
  readonly #full: boolean;

  constructor({ pages, full }: { pages: readonly Page[]; full: boolean }) {
    this.#pages = pages;
    this.#full = full;
  }

  build(): number {
    let generated = 0;
    for (const page of this.#pages) {
      const exists = fileExists(page.outputPath);
      if (exists && !this.#full && !page.hasChanges()) continue;
      page.build();
      generated += 1;
    }
    return generated;
  }
}
