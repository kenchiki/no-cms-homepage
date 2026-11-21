import { parseHtml } from '../html.ts';
import type { LayoutTemplate } from './layout-template.ts';
import { Template } from './template.ts';

type ArchiveValues = { yearNavigation: string; articlesByYear: string };

export class ArchiveTemplate extends Template<ArchiveValues> {
  static readonly sourcePath = 'templates/archive.html';
  #layoutTemplate: LayoutTemplate;

  constructor({ layoutTemplate, previousHash }: { layoutTemplate: LayoutTemplate; previousHash?: string }) {
    super({ sourcePath: ArchiveTemplate.sourcePath, previousHash });
    this.#layoutTemplate = layoutTemplate;
  }

  render(values: ArchiveValues): string {
    const { title, body } = parseHtml(this.text);
    return this.#layoutTemplate.render({ title, body: this.replacePlaceholders(values, body) });
  }
}
