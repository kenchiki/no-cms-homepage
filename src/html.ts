export function parseHtml(text: string): { title: string; body: string } {
  const metadata = new Map<string, string>();
  const metadataLine = /^\s*<!--[ \t]*([a-z][\w-]*):[ \t]*(.*?)[ \t]*-->[ \t]*(?:\r?\n|$)/i;
  let body = text;
  let match = metadataLine.exec(body);
  while (match) {
    metadata.set(match[1].toLowerCase(), match[2].trim());
    body = body.slice(match[0].length);
    match = metadataLine.exec(body);
  }
  return { title: metadata.get('title') ?? '', body: body.trim() };
}
