// One-time recovery of explicit material changes already recorded in the 2026-09-27 report.
// This is not a scan; timestamps and historical flags preserve their original meaning.
import {loadKnowledge} from '../site/scripts/lib/load-knowledge.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const k=await loadKnowledge(process.cwd());
const definitions=[
 ['ev-20260814-04','2026-09-25T21:50:12Z','Claude Code 2.1.283 补强精确模型治理、沙箱拒绝策略和重启后的执行一致性。','Claude Code 2.1.283 strengthens exact model governance, sandbox denial policies and execution consistency after restart.','v2.1.283'],
 ['ev-20260922-04','2026-09-26T00:42:00Z','Qwen Code 0.24.6 增加托管会话日志、故障转移和未知执行状态核对。','Qwen Code 0.24.6 adds a durable session journal, failover and reconciliation of unknown executions.','v0.24.6'],
 ['ev-20260917-08','2026-09-25T23:19:00Z','Pydantic AI 2.51.0 增加 GPT-Live 支持与实时上下文用量，并减少 agent graph 开销。','Pydantic AI 2.51.0 adds GPT-Live support and realtime context usage while reducing agent graph overhead.','v2.51.0'],
 ['ev-20260813-04','2026-09-25','GitHub Copilot 周更增加 JetBrains 辅助审批与远端 Dev Container agent 工作流。','GitHub Copilot weekly adds assisted approvals in JetBrains and agent workflows in remote Dev Containers.','2026-09-25-github-copilot-weekly'],
];
const stamp='2026-09-26T16:01:48Z';const ids=['ev-20260925-01-published','ev-20260925-02-published'];
const index=JSON.parse(await readFile('index/events.json','utf8'));
for(const [id,when,zh,en,urlPart]of definitions){
 const file=index.events.find(e=>e.event_id===id).file;const bucket=JSON.parse(await readFile(file,'utf8'));const e=bucket.events.find(e=>e.event_id===id);
 const evidenceId=`${id}-evidence-recorded-20260927`;const changeId=`${id}-update-recorded-20260927`;
 if(!e.evidence.some(v=>v.id===evidenceId))e.evidence.push({id:evidenceId,claim_zh:zh,claim_en:en,event_ids:[id],source_ids:e.source_ids.filter(sid=>k.sources.find(s=>s.id===sid)?.url.includes(urlPart)),relation:'support',verification:'historical'});
 if(!e.changes.some(v=>v.id===changeId))e.changes.push({id:changeId,kind:'update',occurred_at:when,discovered_at:stamp,summary_zh:zh,summary_en:en,evidence_ids:[evidenceId],historical:true});
 ids.push(changeId);await writeFile(file,JSON.stringify(bucket,null,2)+'\n');
}
const brief={id:'recorded-20260927',as_of:stamp,date:'2026-09-27',baseline:false,historical:true,change_ids:ids,highlights:[{change_id:ids[0],reason_zh:'持续运行的 agent 工作区需要分别评估可用阶段与治理能力。',reason_en:'Evaluate persistent agent workspaces by component availability and governance.'},{change_id:ids[1],reason_zh:'跨 agent 共享修复记忆值得试点，但需要比较回归与错误经验传播。',reason_en:'Shared repair memory merits a pilot that measures regressions and the spread of incorrect lessons.'},{change_id:ids[2],reason_zh:'权限拒绝与恢复一致性直接影响执行可靠性。',reason_en:'Policy denials and recovery consistency directly affect execution reliability.'}],coverage_zh:'来自最近一期已保存简报。新旧来源的检查情况可在来源目录查看。',coverage_en:'From the latest saved briefing. Source check status is available in the source directory.'};
await writeFile('briefings/2026-09-27-recorded.json',JSON.stringify(brief,null,2)+'\n');
console.log('Recovered 4 documented updates and 3 editorial highlights; checkpoint unchanged.');
