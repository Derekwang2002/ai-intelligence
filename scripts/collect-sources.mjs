// Capture public sources for a scan. A reachable page is NOT automatic verification of its claims.
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(await readFile(path.join(root,'config/source-monitors.json'),'utf8'));
const state=JSON.parse(await readFile(path.join(root,'state.json'),'utf8'));
const started=process.argv.find(a=>a.startsWith('--started='))?.slice(10)||new Date().toISOString();
const key=started.replaceAll(':','-');
const dir=path.join(root,'logs','captures',key);await mkdir(dir,{recursive:true});
const from=state.last_successful_run_at||new Date(new Date(started).getTime()-24*3600000).toISOString();
const checks=[];
for(let offset=0;offset<config.monitors.length;offset+=3){
 await Promise.all(config.monitors.slice(offset,offset+3).map(async monitor=>{
  const checked_at=new Date().toISOString();
  try {
   const response=await fetch(monitor.url,{headers:{'User-Agent':'MATRIX-Intelligence/2.0','Accept':'application/json,application/atom+xml,text/html;q=0.9'},signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const body=await response.text();if(body.length<100)throw Error('Empty source body');
   await writeFile(path.join(dir,`${monitor.id}.txt`),body);
   const content_hash=createHash('sha256').update(body).digest('hex');
   checks.push({...monitor,status:'success',checked_at,content_hash,capture:`logs/captures/${key}/${monitor.id}.txt`,analysis_status:'pending'});
  }catch(error){checks.push({...monitor,status:'failed',checked_at,error:String(error.message),analysis_status:'pending'});}
 }));
}
const run={id:key,run_started_at:started,previous_checkpoint:from,window:{start:from,end:started,overlap_start:new Date(new Date(from).getTime()-3*3600000).toISOString()},status:'captured',checks:checks.sort((a,b)=>a.id.localeCompare(b.id)),candidate_decisions:[],stages:{retrieval:false,verification:false,deduplication:false,analysis:false,reports:false,persistence:false},written_files:[],gap_review:null};
await writeFile(path.join(dir,'manifest.json.tmp'),JSON.stringify(run,null,2)+'\n');await rename(path.join(dir,'manifest.json.tmp'),path.join(dir,'manifest.json'));
console.log(JSON.stringify({manifest:path.relative(root,path.join(dir,'manifest.json')),successful:checks.filter(c=>c.status==='success').length,failed:checks.filter(c=>c.status==='failed').map(c=>({id:c.id,error:c.error})),checkpoint_unchanged:from},null,2));
