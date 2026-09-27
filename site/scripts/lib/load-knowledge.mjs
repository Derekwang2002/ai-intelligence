import { readFile, readdir } from 'node:fs/promises';
import { validateKnowledge, materialChanges, SCENARIOS, reportDate } from './intelligence.mjs';
import path from 'node:path';

export async function loadKnowledge(root) {
  const read = async p => JSON.parse(await readFile(path.join(root,p),'utf8'));
  const collection = async dir => {
    const files = (await readdir(path.join(root,dir))).filter(f=>f.endsWith('.json')).sort();
    return Promise.all(files.map(f=>read(`${dir}/${f}`)));
  };
  const [buckets,p,s,t,topics,briefings,r,state] = await Promise.all([
    collection('events'),read('projects/catalog.json'),read('sources/catalog.json'),read('trends/current.json'),
    read('topics/catalog.json'),collection('briefings'),read('reviews/queue.json'),read('state.json'),
  ]);
  const data = { events:buckets.flatMap(b=>b.events), projects:p.projects, sources:s.sources, trends:t.trends, topics:topics.topics, briefings, reviews:r.reviews, state };
  const errors=validateKnowledge(data);
  if(errors.length) throw new Error(errors.join('\n'));
  return data;
}

export function projectKnowledge(data) {
  const { events, projects, sources, trends, topics, briefings, reviews, state } = data;
  const byId = new Map(events.map(e=>[e.event_id,e]));
  const evidence = [...events.flatMap(e=>e.evidence||[]),...trends.flatMap(t=>t.evidence||[])];
  const evidenceById=new Map(evidence.map(e=>[e.id,e]));
  const eventPath=id=>`/events/${id}/`;
  const activity=e=>e.last_updated_at||e.published_at;
  const projectedProjects=projects.map(p=>{
    const related=p.event_ids.map(id=>byId.get(id)).filter(Boolean).sort((a,b)=>activity(b).localeCompare(activity(a)));
    return {...p,latest_event_id:related[0]?.event_id,as_of:related[0]?activity(related[0]):null,scenario_ids:[...new Set(related.flatMap(e=>e.scenario_ids||[]))]};
  });
  const changes=materialChanges(events,trends,topics,projects).map(c=>{
    const event=c.object_type==='event'?byId.get(c.object_id):null;
    const trend=c.object_type==='trend'?trends.find(t=>t.id===c.object_id):null;
    const topic=c.object_type==='topic'?topics.find(t=>t.id===c.object_id):null;
    const project=c.object_type==='project'?projects.find(p=>p.id===c.object_id):null;
    const ev=(c.evidence_ids||[]).map(id=>evidenceById.get(id)).filter(Boolean);
    return {...c,date:reportDate(c.discovered_at),title_zh:event?.title_zh||trend?.name_zh||topic?.question_zh||project?.name_zh,title_en:event?.title||trend?.name_en||topic?.question_en||project?.name_en,
      summary_zh:c.kind==='new'&&event?event.summary_zh:c.summary_zh,summary_en:c.kind==='new'&&event?event.summary_en:c.summary_en,
      path:event?eventPath(event.event_id):`/${c.object_type==='trend'?'trends':c.object_type==='topic'?'topics':'projects'}/${c.object_id}/`, project_ids:project?[project.id]:event?.project_ids||[],
      scenario_ids:event?.scenario_ids||[],topic_ids:topic?[topic.id]:[],trend_ids:topic?topic.trend_ids:trend?[trend.id]:trends.filter(t=>t.evidence?.some(v=>v.event_ids?.includes(c.object_id))).map(t=>t.id),
      source_ids:[...new Set(ev.flatMap(e=>e.source_ids||[]))],importance:c.importance||'normal',
      recommendation:event?.recommendation,stage:event?.evidence_stage||'verified'};
  }).sort((a,b)=>b.discovered_at.localeCompare(a.discovered_at)||a.id.localeCompare(b.id));
  const search=[
    ...events.map(e=>({id:e.event_id,type:'event',title_zh:e.title_zh,title_en:e.title,summary_zh:e.summary_zh,summary_en:e.summary_en,date:reportDate(activity(e)),path:eventPath(e.event_id)})),
    ...projectedProjects.map(p=>({id:p.id,type:'project',title_zh:p.name_zh,title_en:p.name_en,summary_zh:p.aliases.join(' · '),summary_en:p.aliases.join(' · '),date:p.as_of?reportDate(p.as_of):null,path:`/projects/${p.id}/`})),
    ...trends.map(t=>({id:t.id,type:'trend',title_zh:t.name_zh,title_en:t.name_en,summary_zh:t.why_it_matters_zh,summary_en:t.why_it_matters_en,date:t.last_updated,path:`/trends/${t.id}/`})),
    ...topics.map(t=>({id:t.id,type:'topic',title_zh:t.question_zh,title_en:t.question_en,summary_zh:t.answer_zh,summary_en:t.answer_en,date:reportDate(t.as_of),path:`/topics/${t.id}/`})),
  ];
  const sortedBriefings=[...briefings].sort((a,b)=>b.as_of.localeCompare(a.as_of));
  return { version:2,as_of:state.last_successful_run_at,report_date:reportDate(state.last_successful_run_at), projects:projectedProjects,sources,trends,topics,changes,evidence,briefings:sortedBriefings,reviews,scenarios:SCENARIOS,search };
}
