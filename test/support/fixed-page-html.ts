import { rmSync, writeFileSync } from 'node:fs';

export function createFixedPageHtml({
  fileName,
  title,
  body,
}: {
  fileName: string;
  title: string;
  body: string;
}): void {
  writeFileSync(`pages/${fileName}.html`, `<!-- title: ${title} -->\n${body}`);
}

export function deleteFixedPageHtml({ fileName }: { fileName: string }): void {
  rmSync(`pages/${fileName}.html`);
}
