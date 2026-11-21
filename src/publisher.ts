import { lstatSync, mkdirSync, rmSync, rmdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { BuildHashesStore } from './build-hashes-store.ts';
import { BuildPlanner, type BuildPlan } from './build-planner.ts';
import { writeFile } from './infrastructure/files.ts';

const lockPath = '.build-lock';

type OutputChanges = {
  writes: { outputPath: string; html: string }[];
  deletions: string[];
};

export class Publisher {
  publish(full: boolean): { generated: number; deleted: number } {
    try {
      mkdirSync(lockPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new Error('ビルドが実行中です。実行中のビルドがなければ .build-lock を削除してください。');
      }
      throw error;
    }
    try {
      return this.#publish(full);
    } finally {
      rmdirSync(lockPath);
    }
  }

  #publish(full: boolean): { generated: number; deleted: number } {
    const hashStore = new BuildHashesStore();
    const buildPlanner = new BuildPlanner(hashStore);
    const plan = buildPlanner.create();
    const outputChanges = this.#prepareOutputChanges(plan, full);
    const currentHashes = Object.fromEntries(plan.hashTrackers.map(({ sourcePath, hash }) => [sourcePath, hash]));

    this.#applyOutputChanges(outputChanges);
    hashStore.save(currentHashes);

    return { generated: outputChanges.writes.length, deleted: outputChanges.deletions.length };
  }

  #prepareOutputChanges(
    { layoutChanged, removedOutputPaths, currentPages }: BuildPlan,
    full: boolean,
  ): OutputChanges {
    const currentOutputs = new Set(currentPages.map(({ outputPath }) => outputPath));
    const removed = [...new Set(removedOutputPaths)].filter((path) => this.#isGeneratedPath(path) && !currentOutputs.has(path));

    this.#ensureDirectory('docs');
    this.#ensureDirectory('docs/assets');
    const directories = new Set([...currentOutputs, ...removed].map(dirname));
    directories.delete('docs');
    for (const directory of directories) this.#ensureDirectory(directory);

    const rebuildAll = full || layoutChanged;
    const writes = currentPages.filter((page) => {
      const exists = this.#outputExists(page.outputPath);
      return rebuildAll || !exists || page.hasChanges();
    }).map((page) => ({ outputPath: page.outputPath, html: page.render() }));
    const deletions = removed.filter((path) => this.#outputExists(path));
    return { writes, deletions };
  }

  #applyOutputChanges({ writes, deletions }: OutputChanges): void {
    for (const { outputPath, html } of writes) writeFile(outputPath, html);
    for (const path of deletions) rmSync(path);
  }

  #ensureDirectory(path: string): void {
    const entry = lstatSync(path, { throwIfNoEntry: false });
    if (!entry) mkdirSync(path);
    else if (!entry.isDirectory()) throw new Error(`${path} はディレクトリである必要があります。`);
  }

  #outputExists(path: string): boolean {
    const entry = lstatSync(path, { throwIfNoEntry: false });
    if (entry && !entry.isFile()) throw new Error(`${path} は通常のファイルである必要があります。`);
    return !!entry;
  }

  #isGeneratedPath(path: string): boolean {
    return /^docs\/(?:index\.html|archive\.html|(?:articles|pages)\/[^/\\]+\.html)$/.test(path);
  }
}
