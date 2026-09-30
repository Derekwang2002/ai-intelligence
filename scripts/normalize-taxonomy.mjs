// One-time, idempotent alias clean-up for historical events using config/taxonomy.json.
// Dry run by default; --write applies it. It never touches changes, last_updated_at or the checkpoint,
// because renaming a category or organisation is not new intelligence (AGENTS.md §20).
import {readFile,readdir,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const write=process.argv.includes('--write');
const readJson=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
const save=async(p,data)=>{const file=path.join(root,p);await writeFile(file+'.tmp',JSON.stringify(data,null,2)+'\n');await rename(file+'.tmp',file);};
const taxonomy=await readJson('config/taxonomy.json');
const mapOrgs=orgs=>[...new Set((orgs||[]).map(o=>taxonomy.organization_aliases[o]||o))];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const changes=[];let touchedFiles=0;
for(const name of (await readdir(path.join(root,'events'))).filter(f=>f.endsWith('.json')).sort()){
 const bucket=await readJson(`events/${name}`);let dirty=false;
 for(const e of bucket.events){
  const next={category:taxonomy.category_aliases[e.category]||e.category,source_type:taxonomy.source_type_aliases[e.source_type]||e.source_type,organization:mapOrgs(e.organization)};
  for(const key of Object.keys(next))if(!same(e[key],next[key])){changes.push({event_id:e.event_id,field:key,from:e[key],to:next[key]});e[key]=next[key];dirty=true;}
 }
 if(dirty){touchedFiles++;if(write)await save(`events/${name}`,bucket);}
}
const index=await readJson('index/events.json');let indexDirty=false;
for(const entry of index.events){
 const category=taxonomy.category_aliases[entry.category]||entry.category,orgs=mapOrgs(entry.orgs);
 if(category!==entry.category||!same(orgs,entry.orgs)){entry.category=category;entry.orgs=orgs;indexDirty=true;}
}
if(indexDirty&&write)await save('index/events.json',index);
const summary={};for(const c of changes){const k=`${c.field}: ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}`;summary[k]=(summary[k]||0)+1;}
console.log(JSON.stringify({mode:write?'write':'dry-run',event_fields_changed:changes.length,event_files:touchedFiles,index_changed:indexDirty,changes:summary},null,2));
if(!write&&changes.length)console.log('Dry run only. Re-run with --write, then node scripts/validate-intelligence.mjs.');
