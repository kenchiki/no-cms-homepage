import { beforeEach } from '@jest/globals';
import { mkdirSync } from 'node:fs';

export function useSiteDirectories(): void {
  beforeEach(() => {
    mkdirSync('articles');
    mkdirSync('pages');
    mkdirSync('templates');
    mkdirSync('docs/articles', { recursive: true });
    mkdirSync('docs/pages', { recursive: true });
  });
}
