import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { loadKnowledge } from '../site/scripts/lib/load-knowledge.mjs';
import { renderCurrentTrends } from '../site/scripts/lib/trend-markdown.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const k=await loadKnowledge(root);
const trendBoard=JSON.parse(await readFile(path.join(root,'trends/current.json'),'utf8'));
if(await readFile(path.join(root,'trends/current.md'),'utf8')!==renderCurrentTrends(trendBoard))throw Error('Current trend Markdown does not match structured data. Run scripts/render-current-trends.mjs.');
const index=JSON.parse(await readFile(path.join(root,'index/events.json'),'utf8'));
const indexed=new Map(index.events.map(e=>[e.event_id,e.fingerprint]));
if(index.total_events!==k.events.length || indexed.size!==k.events.length || k.events.some(e=>indexed.get(e.event_id)!==e.event_fingerprint))throw Error('Event index mismatch');
for(const directory of ['daily','trends']){
 const files=new Set(await readdir(path.join(root,directory)));
 for(const file of files)if(/^\d{4}-\d{2}-\d{2}(\.en)?\.md$/.test(file)){
  const counterpart=file.includes('.en.')?file.replace('.en.','.'):file.replace('.md','.en.md');
  if(!files.has(counterpart))throw Error(`Missing bilingual counterpart: ${directory}/${counterpart}`);
 }
}
console.log(`Validated ${k.events.length} events, ${k.sources.length} sources, ${k.projects.length} projects, ${k.trends.length} trends, ${k.topics.length} topics.`);
