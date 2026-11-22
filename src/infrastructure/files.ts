import { createHash, randomUUID } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

export type TextFile = Readonly<{ path: string; text: string; hash: string }>;

export function readFile(path: string): TextFile {
  const data = readFileSync(path);
  const hash = createHash('sha256').update(data).digest('hex');
  return { path, text: data.toString('utf8'), hash };
}

export function listPaths(directory: string, extension: string): string[] {
  if (!lstatSync(directory, { throwIfNoEntry: false })) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && extname(entry.name) === extension)
    .map(({ name }) => `${directory}/${name}`)
    .sort();
}

export function writeFile(path: string, content: string): void {
  const temp = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temp, content, { flag: 'wx' });
    renameSync(temp, path);
  } finally {
    rmSync(temp, { force: true });
  }
}

export function deleteFiles(paths: readonly string[]): number {
  let deleted = 0;
  for (const path of paths) {
    if (!fileExists(path)) continue;
    rmSync(path);
    deleted += 1;
  }
  return deleted;
}

export function fileExists(path: string): boolean {
  const entry = lstatSync(path, { throwIfNoEntry: false });
  if (entry && !entry.isFile()) throw new Error(`${path} は通常のファイルである必要があります。`);
  return !!entry;
}
