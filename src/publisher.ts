import { mkdirSync, rmdirSync } from 'node:fs';
import { BuildHashesStore } from './build-hashes-store.ts';
import { PublishPlanFactory } from './publish-plan-factory.ts';

const lockPath = '.build-lock';

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
    const publishPlanFactory = new PublishPlanFactory(hashStore);
    const { pageBuilder, fileRemover, hashTrackers } = publishPlanFactory.create(full);

    const generated = pageBuilder.build();
    const deleted = fileRemover.remove();
    hashStore.save(hashTrackers);

    return { generated, deleted };
  }
}
