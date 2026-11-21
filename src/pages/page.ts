import type { ChangeTracker } from '../change-tracker.ts';

export abstract class Page implements ChangeTracker {
  abstract readonly outputPath: string;
  #changeCheckList: readonly ChangeTracker[];

  protected constructor({ changeCheckList }: { changeCheckList: readonly ChangeTracker[] }) {
    this.#changeCheckList = changeCheckList;
  }

  hasChanges(): boolean {
    return this.#changeCheckList.some((check) => check.hasChanges());
  }

  abstract render(): string;
}
