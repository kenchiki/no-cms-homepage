import { resolve } from 'node:path';
import { compile } from 'sass';
import { writeFile } from '../infrastructure/files.ts';

try {
  const root = resolve(import.meta.dirname, '../..');
  const output = 'docs/assets/css/style.css';
  const outputPath = resolve(root, output);
  const { css } = compile(resolve(root, 'styles/style.scss'));

  writeFile(outputPath, `${css}\n`);
  console.log(`CSS を ${output} に生成しました。`);
} catch (error) {
  console.error('CSS のビルドに失敗しました。', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
