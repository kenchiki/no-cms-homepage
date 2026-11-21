import type { LayoutTemplate } from './layout-template.ts';
import { Template } from './template.ts';

type TopValues = { latestArticles: string };

export class TopTemplate extends Template<TopValues> {
  static readonly sourcePath = 'templates/index.html';
  #layoutTemplate: LayoutTemplate;

  constructor({ layoutTemplate, previousHash }: { layoutTemplate: LayoutTemplate; previousHash?: string }) {
    super({ sourcePath: TopTemplate.sourcePath, previousHash });
    this.#layoutTemplate = layoutTemplate;
  }

  render(values: TopValues): string {
    const body = this.replacePlaceholders(values, this.text);
    return this.#layoutTemplate.render({ body });
  }
}
