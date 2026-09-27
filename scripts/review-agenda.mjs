// Read-only worklist. A queued item is never presented as a completed check.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {reportDate} from '../site/scripts/lib/intelligence.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const queue=JSON.parse(await readFile(path.join(root,'reviews/queue.json'),'utf8'));
const date=process.argv.find(a=>a.startsWith('--date='))?.slice(7)||reportDate(new Date().toISOString());
const due=queue.reviews.filter(r=>(r.next_review_at||r.due_at)<=date&&r.status!=='closed');
const grouped=new Map();
for(const r of due){const item=grouped.get(r.event_id)||{event_id:r.event_id,tasks:[],due_at:r.next_review_at||r.due_at};item.tasks.push(r.id);grouped.set(r.event_id,item);}
console.log(JSON.stringify({as_of:date,due_objects:[...grouped.values()].sort((a,b)=>a.due_at.localeCompare(b.due_at)),gap_review_due:!queue.gap_review?.next_due_at||queue.gap_review.next_due_at<=date,gap_review:queue.gap_review},null,2));
