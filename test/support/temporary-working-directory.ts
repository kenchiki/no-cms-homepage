import { afterEach, beforeEach } from '@jest/globals';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function useTemporaryWorkingDirectory(): void {
  let originalWorkingDirectory: string;
  let temporaryWorkingDirectory: string | undefined;

  beforeEach(() => {
    originalWorkingDirectory = process.cwd();
    temporaryWorkingDirectory = mkdtempSync(join(tmpdir(), 'no-cms-homepage-'));
    process.chdir(temporaryWorkingDirectory);
  });

  afterEach(() => {
    if (temporaryWorkingDirectory === undefined) return;
    process.chdir(originalWorkingDirectory);
    rmSync(temporaryWorkingDirectory, { recursive: true, force: true });
    temporaryWorkingDirectory = undefined;
  });
}
