import { resolve } from 'node:path';
import { Publisher } from '../publisher.ts';

function build(): void {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--full')) {
    throw new Error('使い方: node src/commands/build.ts [--full]');
  }
  process.chdir(resolve(import.meta.dirname, '../..'));
  const publisher = new Publisher();
  const { generated, deleted } = publisher.publish(args[0] === '--full');
  console.log(`HTML を ${generated} 件生成、${deleted} 件削除しました。`);
}

try {
  build();
} catch (error) {
  console.error('ビルドに失敗しました。', error instanceof Error ? error.message : error);
  console.error('原因を解消したら、VS Code の「差分ビルド」を再実行してください。');
  console.error('HTML の書き込み・削除が途中で止まった場合は、「フルビルド」を実行してください。');
  process.exitCode = 1;
}
