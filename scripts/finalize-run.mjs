// Validate all persistence, build and test before the single final checkpoint replacement.
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadKnowledge} from '../site/scripts/lib/load-knowledge.mjs';
import {reportDate} from '../site/scripts/lib/intelligence.mjs';
import {runGate,decisionGate} from '../site/scripts/lib/run-gate.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arg=process.argv.find(a=>a.startsWith('--manifest='));if(!arg)throw Error('Use --manifest=logs/run-<id>.json [--commit]');
const manifestPath=path.resolve(root,arg.slice(11));
const run=JSON.parse(await readFile(manifestPath,'utf8'));
const original=await readFile(path.join(root,'state.json'),'utf8');const state=JSON.parse(original);
try{
 const monitors=JSON.parse(await readFile(path.join(root,'config/source-monitors.json'),'utf8'));
 for(const monitor of monitors.monitors.filter(m=>m.required))if(!run.checks?.some(c=>c.id===monitor.id&&c.required))throw Error(`Missing required monitor: ${monitor.id}`);
 const errors=runGate(run,state.last_successful_run_at);if(errors.length)throw Error(errors.join('\n'));
 const knowledge=await loadKnowledge(root);
 const decisionErrors=decisionGate(run,new Set(knowledge.events.map(e=>e.event_id)));if(decisionErrors.length)throw Error(decisionErrors.join('\n'));
 const date=reportDate(run.run_started_at);
 for(const dir of ['daily','trends']){
  const [zh,en]=await Promise.all(['','.en'].map(s=>readFile(path.join(root,dir,`${date}${s}.md`),'utf8')));
  const headings=text=>[...text.matchAll(/^## (.+)$/gm)].map(x=>x[1].replace(/^(趋势|Trend)\s*#(\d+).*$/i,'trend-$2'));
  if(JSON.stringify(headings(zh))!==JSON.stringify(headings(en)))throw Error(`${dir} bilingual section mismatch`);
 }
 const files=[`daily/${date}.md`,`daily/${date}.en.md`,`trends/${date}.md`,`trends/${date}.en.md`,'trends/current.json','trends/current.md','index/events.json','sources/catalog.json','reviews/queue.json'];
 for(const f of files)if(!run.written_files.includes(f))throw Error(`Missing persisted file in manifest: ${f}`);
 const check=spawnSync('npm',['run','check'],{cwd:path.join(root,'site'),encoding:'utf8',env:{...process.env,MATRIX_PENDING_RUN:run.id}});
 if(check.status!==0)throw Error(`Validation/test/build failed:\n${check.stdout}\n${check.stderr}`);
 if(await readFile(path.join(root,'state.json'),'utf8')!==original)throw Error('Checkpoint changed during validation.');
 const next={...state,last_successful_run_at:run.run_started_at,last_run_started_at:run.run_started_at,last_run_completed_at:new Date().toISOString(),total_runs:(state.total_runs||0)+1,scan_window:{start:run.previous_checkpoint,end:run.run_started_at,retrieval_overlap_start:run.window.overlap_start},notes:run.summary_en};
 if(process.argv.includes('--commit')){
  await writeFile(path.join(root,'state.json.tmp'),JSON.stringify(next,null,2)+'\n');await rename(path.join(root,'state.json.tmp'),path.join(root,'state.json'));
  console.log(`Checkpoint advanced to run START ${run.run_started_at}. Rebuild the site to publish this checkpoint.`);
 }else console.log(`All gates passed. Dry run only; checkpoint remains ${state.last_successful_run_at}.`);
}catch(error){await mkdir(path.join(root,'logs'),{recursive:true});await writeFile(path.join(root,'logs',`failed-finalize-${run.id}.json`),JSON.stringify({run_started_at:run.run_started_at,run_failed_at:new Date().toISOString(),error_stage:'finalization',error_summary:error.message,written_files:run.written_files||[],recovery:'Correct the failed stage; checkpoint is unchanged. Rerun validation and finalization.'},null,2)+'\n');throw error;}
