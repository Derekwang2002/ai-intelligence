export function runGate(run, checkpoint) {
 const errors=[];
 if(run.previous_checkpoint!==checkpoint)errors.push('Checkpoint changed during scan; rebase the scan before committing.');
 if(!run.run_started_at||!Number.isFinite(Date.parse(run.run_started_at))||Date.parse(run.run_started_at)<=Date.parse(checkpoint))errors.push('Run start must be later than the checkpoint.');
 for(const stage of ['retrieval','verification','deduplication','analysis','reports','persistence'])if(run.stages?.[stage]!==true)errors.push(`Incomplete stage: ${stage}`);
 if(!run.checks?.length)errors.push('No source checks recorded.');
 for(const check of run.checks||[]){if(check.required && (!['success','changed','unchanged'].includes(check.status)||check.analysis_status!=='complete'))errors.push(`Required source unresolved: ${check.id}`);}
 if(!Array.isArray(run.candidate_decisions))errors.push('Candidate decisions are missing.');
 return errors;
}

// Deployment must never publish a partly persisted run. Only the finalizer may
// build its named candidate before atomically committing the checkpoint.
export function publicationGate(briefings, checkpoint, candidateId) {
 return briefings.filter(b=>!b.baseline&&Date.parse(b.as_of)>Date.parse(checkpoint)&&b.id!==candidateId)
  .map(b=>`Uncommitted briefing ${b.id}: finalize its run before publishing.`);
}
