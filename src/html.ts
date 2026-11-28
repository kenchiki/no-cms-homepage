export function parseHtml(text: string): { title: string; body: string } {
  const metadata = parseMetadata(text);
  return { title: metadata.get('title') ?? '', body: text.trim() };
}

export function parseMetadata(text: string): Map<string, string> {
  const metadata = new Map<string, string>();
  const metadataLine = /^\s*<!--[ \t]*([a-z][\w-]*):[ \t]*(.*?)[ \t]*-->[ \t]*(?:\r?\n|$)/i;
  let remaining = text;
  let match = metadataLine.exec(remaining);
  while (match) {
    metadata.set(match[1].toLowerCase(), match[2].trim());
    remaining = remaining.slice(match[0].length);
    match = metadataLine.exec(remaining);
  }
  return metadata;
}

export function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
