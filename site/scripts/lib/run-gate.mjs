import {RUN_DECISIONS,DECISIONS_CITING_EVENT} from './intelligence.mjs';
const FETCHED=['success','changed','unchanged'];

export function runGate(run, checkpoint) {
 const errors=[];
 if(run.previous_checkpoint!==checkpoint)errors.push('Checkpoint changed during scan; rebase the scan before committing.');
 if(!run.run_started_at||!Number.isFinite(Date.parse(run.run_started_at))||Date.parse(run.run_started_at)<=Date.parse(checkpoint))errors.push('Run start must be later than the checkpoint.');
 for(const stage of ['retrieval','verification','deduplication','analysis','reports','persistence'])if(run.stages?.[stage]!==true)errors.push(`Incomplete stage: ${stage}`);
 if(!run.checks?.length)errors.push('No source checks recorded.');
 for(const check of run.checks||[]){
  if(check.required && (!FETCHED.includes(check.status)||check.analysis_status!=='complete'))errors.push(`Required source unresolved: ${check.id}`);
  // A fetched optional source still has to be read; capturing it is not coverage.
  else if(!check.required && FETCHED.includes(check.status) && check.analysis_status!=='complete')errors.push(`Fetched source not analysed: ${check.id}`);
 }
 if(!Array.isArray(run.candidate_decisions))errors.push('Candidate decisions are missing.');
 const audit=run.recall_audit;
 if(!audit?.checked_at)errors.push('Recall audit missing: run scripts/recall-audit.mjs before finalizing.');
 else{
  for(const signal of audit.sources||[])if(signal.status!=='success'&&!signal.recovery?.trim())errors.push(`Recall signal ${signal.id} failed without a recovery note.`);
  for(const item of audit.items||[])if(!item.disposition)errors.push(`Recall item undecided: ${item.title}`);
 }
 return errors;
}

// Every disposition uses the fixed vocabulary, and any claim about an existing
// event must name one that is really in the knowledge base.
export function decisionGate(run, eventIds) {
 const errors=[];
 const entries=[
  ...(run.candidate_decisions||[]).map(d=>({label:d.candidate,decision:d.decision,event_id:d.event_id})),
  ...(run.recall_audit?.items||[]).filter(i=>i.disposition).map(i=>({label:i.title,decision:i.disposition,event_id:i.event_id})),
 ];
 for(const {label,decision,event_id} of entries){
  if(!RUN_DECISIONS.includes(decision))errors.push(`Unknown decision "${decision}" for ${label}; use AGENTS.md §20 values and put detail in reason_code.`);
  else if(DECISIONS_CITING_EVENT.includes(decision)&&!eventIds.has(event_id))errors.push(`"${decision}" for ${label} must cite an existing event_id (got ${event_id??'none'}).`);
 }
 return errors;
}

// Deployment must never publish a partly persisted run. Only the finalizer may
// build its named candidate before atomically committing the checkpoint.
export function publicationGate(briefings, checkpoint, candidateId) {
 return briefings.filter(b=>!b.baseline&&Date.parse(b.as_of)>Date.parse(checkpoint)&&b.id!==candidateId)
  .map(b=>`Uncommitted briefing ${b.id}: finalize its run before publishing.`);
}
