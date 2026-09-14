import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = fileURLToPath(new URL('../build/', import.meta.url));
const source = join(outputDirectory, 'blog', 'rss.xml');
const destination = join(outputDirectory, 'feed.xml');
const feed = await readFile(source, 'utf8');

if (!feed.includes('<rss') || !feed.includes('<item>')) {
  throw new Error('canonical-feed: the generated LabFlow blog RSS feed is empty or malformed');
}

await writeFile(destination, feed, 'utf8');
console.log('canonical-feed: copied the generated blog RSS to build/feed.xml');
