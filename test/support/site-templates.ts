import { beforeEach } from '@jest/globals';
import { cpSync } from 'node:fs';

export function useSiteTemplates(): void {
  beforeEach(() => {
    cpSync(new URL('../../templates/', import.meta.url), 'templates', { recursive: true, dereference: true });
  });
}
