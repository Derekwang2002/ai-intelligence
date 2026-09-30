// Recall self-check. Lists widely noticed AI items that the knowledge base does not cover,
// so every miss becomes an explicit disposition in the run manifest instead of a silent gap.
// HN and HF are attention signals only; never cite them as the factual source of an event.
import {readFile,readdir,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isAiStory,isDerivativeModel,buildMatcher,classifyRecall,handledRecallIds} from '../site/scripts/lib/recall.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')).map(a=>{const [k,...v]=a.slice(2).split('=');return [k,v.join('=')];}));
if(!args.manifest)throw Error('Use --manifest=logs/run-<id>.json [--min-points=150] [--lookback-hours=72] [--hf-limit=30] [--hf-max-age-days=14]');
const minPoints=Number(args['min-points']||150),lookbackHours=Number(args['lookback-hours']||72),hfLimit=Number(args['hf-limit']||30),hfMaxAgeDays=Number(args['hf-max-age-days']||14);
const manifestPath=path.resolve(root,args.manifest);
const run=JSON.parse(await readFile(manifestPath,'utf8'));
const end=Date.parse(run.run_started_at),start=Date.parse(run.window?.start??run.previous_checkpoint);
if(!Number.isFinite(end)||!Number.isFinite(start))throw Error('Manifest needs run_started_at and window.start.');
// HN scores keep rising after posting, so look back further than the scan window.
const from=Math.min(start-24*3600e3,end-lookbackHours*3600e3);

const readJson=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
const eventFiles=(await readdir(path.join(root,'events'))).filter(f=>f.endsWith('.json'));
const events=(await Promise.all(eventFiles.map(f=>readJson(`events/${f}`)))).flatMap(b=>b.events);
const sources=(await readJson('sources/catalog.json')).sources;
const logFiles=(await readdir(path.join(root,'logs'))).filter(f=>/^run-.+\.json$/.test(f)&&path.join(root,'logs',f)!==manifestPath);
const previous=await Promise.all(logFiles.map(f=>readJson(`logs/${f}`).catch(()=>null)));

async function getJson(url){
 const response=await fetch(url,{headers:{'User-Agent':'MATRIX-Intelligence/2.0','Accept':'application/json'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`HTTP ${response.status}`);
 return response.json();
}
const signals=[
 {id:'hn',url:`https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=500&numericFilters=${encodeURIComponent(`created_at_i>${Math.floor(from/1000)},created_at_i<${Math.floor(end/1000)},points>=${minPoints}`)}`,
  items:data=>data.hits.filter(h=>isAiStory(h.title)).map(h=>({id:`hn:${h.objectID}`,signal:'hn',title:h.title,url:h.url||`https://news.ycombinator.com/item?id=${h.objectID}`,discussion_url:`https://news.ycombinator.com/item?id=${h.objectID}`,score:h.points,published_at:h.created_at}))},
 {id:'hf-trending',url:`https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=${hfLimit}`,
  items:data=>data.filter(m=>Date.parse(m.createdAt)>=end-hfMaxAgeDays*86400e3&&!isDerivativeModel(m.id)).map(m=>({id:`hf:${m.id}`,signal:'hf',title:m.id,model_id:m.id,url:`https://huggingface.co/${m.id}`,score:m.trendingScore,published_at:m.createdAt}))},
];
const checked_at=new Date().toISOString(),collected=[],sourceResults=[];
const earlier=new Map((run.recall_audit?.sources||[]).map(s=>[s.id,s]));
for(const signal of signals){
 try{const items=signal.items(await getJson(signal.url));collected.push(...items);sourceResults.push({id:signal.id,status:'success',count:items.length});}
 catch(error){sourceResults.push({id:signal.id,status:'failed',error:String(error.message),recovery:earlier.get(signal.id)?.recovery??null});}
}
const result=classifyRecall(collected,buildMatcher(events,sources),{handled:handledRecallIds(previous),existing:run.recall_audit?.items||[]});
run.recall_audit={checked_at,window:{from:new Date(from).toISOString(),to:run.run_started_at},thresholds:{min_points:minPoints,hf_limit:hfLimit,hf_max_age_days:hfMaxAgeDays},sources:sourceResults,matched:result.matched,previously_handled:result.skipped.length,items:result.pending};
await writeFile(manifestPath+'.tmp',JSON.stringify(run,null,2)+'\n');await rename(manifestPath+'.tmp',manifestPath);
console.log(JSON.stringify({manifest:path.relative(root,manifestPath),sources:sourceResults,matched:result.matched.length,previously_handled:result.skipped.length,
 needs_disposition:result.pending.filter(i=>!i.disposition).map(i=>({id:i.id,title:i.title,url:i.url,score:i.score,suggested_event_ids:i.suggested_event_ids}))},null,2));
