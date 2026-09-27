// The structured board is authoritative; preserve numbering and review history.
export function renderCurrentTrends(data) {
 const lines=[`# 当前趋势看板 — ${data.as_of}`,''];
 for(const [i,t]of data.trends.entries()){
  if(t.retired)continue;
  lines.push(`## 趋势 #${i+1}：${t.name_zh}`,'',`- **Status:** ${t.status}`,`- **Confidence:** ${t.confidence}`,`- **First observed:** ${t.first_observed}`,`- **Last updated:** ${t.last_updated}`,`- **Time Horizon:** ${t.time_horizon||'Emerging'}`,`- **当前判断:** ${t.status_note_zh}`,`- **Why It Matters:** ${t.why_it_matters_zh}`,`- **What Would Confirm It:** ${t.what_would_confirm_zh}`,'','### Evidence','',...t.evidence_zh.map((v,n)=>`${n+1}. ${v}`),'','### 逐次复核','',...t.updates.map(v=>`- ${v.run_started_at||v.date}：${v.note_zh}`),'');
 }
 lines.push('## Invalidated / retired','',...data.trends.filter(t=>t.retired).map(t=>`${t.name_zh} — ${t.status_note_zh}`));
 return lines.join('\n').trimEnd()+'\n';
}
