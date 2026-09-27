import {readFile,writeFile,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderCurrentTrends} from '../site/scripts/lib/trend-markdown.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const board=JSON.parse(await readFile(path.join(root,'trends/current.json'),'utf8'));
await writeFile(path.join(root,'trends/current.md.tmp'),renderCurrentTrends(board));
await rename(path.join(root,'trends/current.md.tmp'),path.join(root,'trends/current.md'));
