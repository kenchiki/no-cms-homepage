import { rmSync, writeFileSync } from 'node:fs';

export function createArticleMarkdown({
  fileName,
  title,
  body,
}: {
  fileName: string;
  title: string;
  body: string;
}): void {
  writeFileSync(`articles/${fileName}.md`, `# ${title}\n\n${body}\n`);
}

export function deleteArticleMarkdown({ fileName }: { fileName: string }): void {
  rmSync(`articles/${fileName}.md`);
}
