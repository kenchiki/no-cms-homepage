import type { ChangeTracker } from '../change-tracker.ts';
import { writeFile } from '../infrastructure/files.ts';

export abstract class Page implements ChangeTracker {
  abstract readonly outputPath: string;
  #changeCheckList: readonly ChangeTracker[];

  protected constructor({ changeCheckList }: { changeCheckList: readonly ChangeTracker[] }) {
    this.#changeCheckList = changeCheckList;
  }

  hasChanges(): boolean {
    return this.#changeCheckList.some((check) => check.hasChanges());
  }

  build(): void {
    writeFile(this.outputPath, this.render());
  }

  protected abstract render(): string;
}
