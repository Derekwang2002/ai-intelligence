// Idempotent enrichment. Does not move the scan checkpoint or rewrite historical claims.
import { readFile, readdir, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { idFor, canonicalUrl, sourceKind, sourceTitle, extractEventIds, scenarioIds, addDays, reportDate, validateKnowledge } from '../site/scripts/lib/intelligence.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async (p, fallback) => { try { return JSON.parse(await readFile(path.join(root,p),'utf8')); } catch(e) { if(e.code === 'ENOENT' && fallback !== undefined) return fallback; throw e; } };
const state = await read('state.json');
const asOf = state.last_successful_run_at;
const files = (await readdir(path.join(root,'events'))).filter(x=>x.endsWith('.json')).sort();
const buckets = await Promise.all(files.map(readEvent));
async function readEvent(name) { return {name, data: await read(`events/${name}`)}; }
const events = buckets.flatMap(b=>b.data.events);
const known = new Set(events.map(e=>e.event_id));
const sourceMap = new Map((await read('sources/catalog.json',{sources:[]})).sources.map(s=>[s.id,s]));
const projectConfig = [
 ['claude-code','Claude Code','developer-tool','Claude Code'], ['qwen-code','Qwen Code','developer-tool','Qwen Code'],
 ['github-copilot','GitHub Copilot','developer-tool','GitHub.*Copilot|GitHub.*autofix'], ['codex','Codex','developer-tool','\\bCodex\\b'],
 ['cursor','Cursor','developer-tool','\\bCursor\\b'],['gemini-cli','Gemini CLI','developer-tool','Gemini CLI'],
 ['pydantic-ai','Pydantic AI','framework','Pydantic AI'],['vllm','vLLM','framework','\\bvLLM\\b'],
 ['sglang','SGLang','framework','\\bSGLang\\b'],['deepseek','DeepSeek','model-family','DeepSeek'],
 ['qwen','Qwen models','model-family','Qwen(?! Code)'],['glm','GLM models','model-family','GLM[- ]'],
 ['mcp','MCP','protocol','\\bMCP\\b|Model Context Protocol'],['kimi','Kimi','model-family','\\bKimi\\b'],
 ['gemini','Gemini models','model-family','Gemini(?! CLI)'],['microsoft-copilot','Microsoft Copilot','developer-tool','Microsoft.*Copilot'],
 ['langchain','LangChain','framework','LangChain|LangGraph|Deep Agents|deepagents'],['llama-cpp','llama.cpp','framework','llama\\.cpp'],
];
projectConfig.push(['gpt-6','GPT-6','model-family','GPT-6']);
const oldProjects = new Map((await read('projects/catalog.json',{projects:[]})).projects.map(p=>[p.id,p]));
const projects = projectConfig.map(([id,name,type,pattern])=>({id,name_zh:name.replace(' models',' 模型'),name_en:name,type,aliases:[name],pattern, event_ids:[],source_ids:[],...oldProjects.get(id)}));
for(const [id,p] of oldProjects)if(!projects.some(v=>v.id===id))projects.push(p);
for(const e of events) {
 const urls = [e.primary_source,...(e.secondary_sources||[])].filter(Boolean);
 const sourceIds=[];
 for(const raw of urls) {
  let url; try { url=canonicalUrl(raw); } catch { continue; }
  const id=idFor('src',url); sourceIds.push(id);
  if(!sourceMap.has(id)) sourceMap.set(id,{id,url,title:sourceTitle(url),publisher:new URL(url).hostname,kind:sourceKind(url),official:null,verification:'historical',published_at:null,last_checked_at:null,checks:[],provenance:'Imported reference from the existing knowledge base; not independently rechecked during migration.'});
 }
 e.source_ids ??= [...new Set(sourceIds)];
 e.project_ids ??= projects.filter(p=>p.pattern&&new RegExp(p.pattern,'i').test(e.title)).map(p=>p.id);
 e.scenario_ids ??= scenarioIds(e);
 e.evidence_stage ??= (e.category==='research'||sourceKind(e.primary_source)==='paper')?'frontier':'verified';
 e.record_origin ??= 'historical-migration';
 e.evidence ??= [{id:`${e.event_id}-evidence-summary`,claim_zh:e.summary_zh,claim_en:e.summary_en,source_ids:e.source_ids.slice(0,1),event_ids:[e.event_id],verification:'historical',relation:'background'}];
 e.changes ??= [{id:`${e.event_id}-published`,kind:'new',occurred_at:e.published_at,discovered_at:e.first_seen_at,summary_zh:e.title_zh,summary_en:e.title,evidence_ids:[e.evidence[0].id],historical:true}];
 for(const p of projects.filter(p=>e.project_ids.includes(p.id))) { if(!p.event_ids.includes(e.event_id))p.event_ids.push(e.event_id);p.source_ids=[...new Set([...p.source_ids,...e.source_ids])]; }
}
for(const p of projects) {
 const latest=events.filter(e=>p.event_ids.includes(e.event_id)).sort((a,b)=>b.last_updated_at.localeCompare(a.last_updated_at))[0];
 p.current_judgment_event_id ??= latest?.event_id;
 p.official_source_ids ??= [];
 p.last_reviewed_at ??= null;
}
const trendsDoc=await read('trends/current.json');
for(const t of trendsDoc.trends) {
 t.evidence ??= (t.evidence_zh||[]).flatMap((claim,i)=>{
  const event_ids=extractEventIds(claim,known);
  if(!event_ids.length)return [];
  return [{id:idFor('tev',`${t.id}:${i}:${claim}`),claim_zh:claim,claim_en:t.evidence_en?.[i]||claim,event_ids,source_ids:[],relation:'support',verification:'historical'}];
 });
 t.changes ??= [];
}
const topicsSeed=[
 {id:'open-weight-coding',question_zh:'开放权重模型能否承担 coding agent 工作流？',question_en:'Can open-weight models support coding agent workflows?',trend_ids:[trendsDoc.trends[0].id],answer_zh:'现有档案记录了开放权重模型及部署生态的进展。选型仍需在自己的任务、硬件与工具链上验证，不能把厂商评测直接等同于本地工作流表现。',answer_en:'The archive tracks progress in open-weight models and serving tools. Selection still requires tests on your own tasks, hardware and toolchain; vendor benchmarks do not establish local workflow performance.',boundary_zh:'适用于有能力部署和评估模型的团队。许可证、硬件预算和独立复现是决策前提。',boundary_en:'For teams able to deploy and evaluate models. Licensing, hardware budgets and independent reproduction remain prerequisites.',questions_zh:['公开权重在相同任务与预算下能否复现结果？','部署成本和维护负担是否优于托管 API？'],questions_en:['Can the public weights reproduce results at comparable task and budget settings?','Does deployment cost and maintenance compare favorably with hosted APIs?']},
 {id:'reliable-long-running-agents',question_zh:'长时程 Agent 距离可靠运行还缺什么？',question_en:'What do long-running agents still need for reliability?',trend_ids:[trendsDoc.trends[2].id,trendsDoc.trends[6].id],answer_zh:'现有信号集中在持久状态、恢复、权限和可审计执行。功能存在不代表可靠性已经成立，试点应验证失败后的恢复与外部副作用，而不只观察一次成功演示。',answer_en:'Current signals focus on persistent state, recovery, permissions and auditable execution. Feature availability alone does not establish reliability. Pilots should test recovery and external side effects, beyond a successful demo.',boundary_zh:'适用于需要长时间执行和工具调用的工作流。不同产品的托管边界与可用阶段需分别核验。',boundary_en:'For workflows involving long execution and tool use. Verify each product’s hosting boundaries and availability separately.',questions_zh:['重启后能否避免重复执行有副作用的操作？','权限、审计和人工升级路径是否可验证？'],questions_en:['Can recovery avoid repeating side-effecting actions?','Are permissions, audit and human escalation verifiable?']},
 {id:'mcp-enterprise-adoption',question_zh:'MCP 企业采用的条件与限制是什么？',question_en:'What does enterprise MCP adoption require?',trend_ids:[trendsDoc.trends[1].id],answer_zh:'MCP 连接能力与企业治理需要分开评估。现有档案可用于筛选试点，但身份、最小权限、配额和审计必须在实际部署中验证。',answer_en:'Evaluate MCP connectivity separately from enterprise governance. The archive can inform pilots, but identity, least privilege, quotas and audit must be tested in the actual deployment.',boundary_zh:'适用于接入企业系统与受保护数据的团队。支持协议不等于满足企业上线要求。',boundary_en:'For teams connecting enterprise systems and protected data. Protocol support alone does not establish production readiness.',questions_zh:['工具发现与调用是否都受同一身份和权限约束？','跨供应商的策略与审计是否一致？'],questions_en:['Do discovery and invocation enforce the same identity and permissions?','Are policy and audit consistent across vendors?']},
];
const oldTopics=new Map((await read('topics/catalog.json',{topics:[]})).topics.map(t=>[t.id,t]));
const topics=topicsSeed.map(t=>oldTopics.get(t.id)||({...t,evidence_ids:trendsDoc.trends.filter(tr=>t.trend_ids.includes(tr.id)).flatMap(tr=>tr.evidence.map(e=>e.id)),as_of:asOf,provenance:'Synthesis of existing archive; outstanding questions remain open.'}));
for(const [id,t]of oldTopics)if(!topics.some(v=>v.id===id))topics.push(t);
const oldReviews=await read('reviews/queue.json',{reviews:[]});
const reviews=oldReviews.reviews;
if(!reviews.length)for(const e of events.filter(e=>e.evidence_stage==='frontier'||/preview|beta/i.test(JSON.stringify(e.technical_details)))) {
 for(const days of [7,30])reviews.push({id:`${e.event_id}-review-${days}`,event_id:e.event_id,due_at:addDays(e.published_at,days),trigger:'availability-or-independent-evidence',status:'pending',last_result:null,last_checked_at:null});
}
const existingBrief=await read('briefings/archive-baseline.json',null);
// The baseline is an archive index, not a new scan and never a new unread notification.
const brief=existingBrief||{id:'archive-baseline',as_of:asOf,date:reportDate(asOf),baseline:true,change_ids:events.flatMap(e=>e.changes.map(c=>c.id)),highlights:[],coverage_zh:'历史档案已导入；来源检查状态以实际检查记录为准。',coverage_en:'Archive imported. Source coverage is reported only from recorded checks.'};
const sources=[...sourceMap.values()].sort((a,b)=>a.id.localeCompare(b.id));
const errors=validateKnowledge({events,projects:projects.filter(p=>p.event_ids.length),sources,trends:trendsDoc.trends,topics,briefings:[brief],reviews});
if(errors.length)throw new Error(errors.join('\n'));
const writes=new Map(buckets.map(b=>[`events/${b.name}`,b.data]));
writes.set('trends/current.json',trendsDoc);
writes.set('projects/catalog.json',{version:1,projects:projects.filter(p=>p.event_ids.length)});
writes.set('sources/catalog.json',{version:1,sources});
writes.set('topics/catalog.json',{version:1,topics});
writes.set('reviews/queue.json',{...oldReviews,version:1,reviews});
writes.set('briefings/archive-baseline.json',brief);
let changed=0;const differences=[];
for(const [file,data]of writes){const next=JSON.stringify(data,null,2)+'\n';let prev='';try{prev=await readFile(path.join(root,file),'utf8')}catch(e){if(e.code!=='ENOENT')throw e}if(prev===next)continue;changed++;differences.push({file,bytes_before:Buffer.byteLength(prev),bytes_after:Buffer.byteLength(next)});if(process.argv.includes('--write')){await mkdir(path.dirname(path.join(root,file)),{recursive:true});await writeFile(path.join(root,file+'.tmp'),next);await rename(path.join(root,file+'.tmp'),path.join(root,file));}}
console.log(JSON.stringify({mode:process.argv.includes('--write')?'write':'dry-run',events:events.length,projects:projects.filter(p=>p.event_ids.length).length,sources:sources.length,topics:topics.length,changed_files:changed,differences,checkpoint_unchanged:asOf},null,2));
