import {emptyState,loadState,saveState,toggleValue,normalizeState,selectChanges,RANGES,STORAGE_KEY} from './reader-store.mjs';
import {attachFoldAnim} from './detailsFold';
const zh=document.documentElement.lang!=='en';
const w=(a:string,b:string)=>zh?a:b;
let storage:Storage|undefined;
try{storage=window.localStorage;}catch{}
let loaded=loadState(storage);
let state=loaded.state;
const status=document.getElementById('reader-status');
function announce(text:string){if(status){status.hidden=false;status.textContent=text;}}
if(!loaded.available)announce(w('浏览器存储不可用或阅读记录损坏。仍可阅读，本次偏好可能无法保存。','Browser storage is unavailable or reading data is damaged. Reading remains available; preferences may not persist.'));
function persist(){const saved=saveState(storage,state);if(!saved)announce(w('本次偏好未能保存到浏览器。','Preferences could not be saved in this browser.'));window.dispatchEvent(new Event('matrix:reader'));}
function sync(){
 document.querySelectorAll<HTMLButtonElement>('[data-follow]').forEach(b=>{const yes=state.follows.includes(b.dataset.follow!);b.setAttribute('aria-pressed',String(yes));b.textContent=yes?w('✓ 已关注','✓ Following'):w('＋ 关注','＋ Follow');});
 document.querySelectorAll<HTMLButtonElement>('[data-bookmark]').forEach(b=>{const yes=state.bookmarks.includes(b.dataset.bookmark!);b.setAttribute('aria-pressed',String(yes));b.textContent=yes?w('已收藏','Saved'):w('收藏','Save');});
 document.querySelectorAll<HTMLButtonElement>('[data-read]').forEach(b=>{const yes=state.read.includes(b.dataset.read!);b.setAttribute('aria-pressed',String(yes));b.textContent=yes?w('✓ 已读','✓ Read'):w('标为已读','Mark read');});
 document.querySelectorAll<HTMLElement>('[data-saved-item]').forEach(el=>el.hidden=!state.bookmarks.includes(el.dataset.savedItem!));
 document.querySelectorAll<HTMLElement>('[data-follow-item]').forEach(el=>el.hidden=!state.follows.includes(el.dataset.followItem!));
 const empty=document.querySelector<HTMLElement>('[data-saved-empty]');if(empty)empty.hidden=state.bookmarks.length>0;
 const followEmpty=document.querySelector<HTMLElement>('[data-follow-empty]');if(followEmpty)followEmpty.hidden=state.follows.length>0;
}
document.addEventListener('click',ev=>{
 const button=(ev.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return;
 if(button.dataset.follow){state=toggleValue(state,'follows',button.dataset.follow);persist();}
 if(button.dataset.bookmark){state=toggleValue(state,'bookmarks',button.dataset.bookmark);persist();}
 if(button.dataset.read){state=toggleValue(state,'read',button.dataset.read);persist();}
});
window.addEventListener('matrix:reader',sync);
window.addEventListener('storage',ev=>{if(ev.key===STORAGE_KEY){loaded=loadState(storage);state=loaded.state;window.dispatchEvent(new Event('matrix:reader'));}});
sync();
attachFoldAnim('details.matrix-fold','.fold-body');
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for(const node of document.querySelectorAll<HTMLElement>('[data-as-of]')){
 if(Date.now()-new Date(node.dataset.asOf!).getTime()>36*3600*1000){node.hidden=false;node.textContent=w('资料已超过 36 小时未更新，以下为最近一次成功扫描的结果。','Data has not been refreshed for over 36 hours. This is the latest successful scan.');}
}
for(const feed of document.querySelectorAll<HTMLElement>('[data-feed]')){
 // Returning readers start at what they have not read; everyone else at the latest briefing.
 let range=state.completed_version||state.read.length?'unread':'latest';
 let count=10;
 const params=new URLSearchParams(location.search);
 const requested=params.get('range');const explicit=RANGES.includes(requested||'');if(explicit)range=requested!;
 const requestedDate=params.get('date');let date=requestedDate&&/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)?requestedDate:undefined;
 if(date)range='today';
 let visibleIds:string[]=[];
 const groups=[...feed.querySelectorAll<HTMLElement>('[data-feed-item]')];
 function apply(){
  let matched=0;visibleIds=[];let essential=0;
  const ranked=groups.map(el=>{
   const rows=[...el.querySelectorAll<HTMLElement>('[data-change]')].map(node=>({node,...JSON.parse(node.dataset.change!)}));
   const selected=selectChanges(rows,{range,today,read:state.read,date});
   const keys: string[]=JSON.parse(el.dataset.followKeys||'[]');
   const follows=keys.some(key=>state.follows.includes(key));
   const global=selected.some((r:any)=>r.importance==='major');
   return {el,rows,selected,keys,follows,global};
  }).sort((a,b)=>{
   if(feed.dataset.following==='true'&&a.follows!==b.follows)return Number(b.follows)-Number(a.follows);
   const ah=a.selected.some((r:any)=>r.highlight),bh=b.selected.some((r:any)=>r.highlight);
   if(ah!==bh)return Number(bh)-Number(ah);
   return (b.selected[0]?.date||'').localeCompare(a.selected[0]?.date||'');
  });
  for(const {el,rows,selected,keys,follows,global}of ranked){
   const relevant=feed.dataset.following!=='true'||follows||global;
   const ok=relevant&&selected.length>0;
   el.hidden=!ok||matched>=count;
   if(ok)matched++;
   for(const row of rows)row.node.hidden=!selected.some((r:any)=>r.id===row.id);
   if(ok){
    const first=selected[0];el.querySelector('time')!.textContent=first.date;
    const titleLink=el.querySelector<HTMLAnchorElement>('h2 a'),parent=el.querySelector<HTMLElement>('.brief-parent');
    const headline=first.kind!=='new'&&first.lead;
    if(titleLink)titleLink.textContent=headline||titleLink.dataset.title||titleLink.textContent;
    if(parent)parent.hidden=!headline;
    for(const row of rows){const summary=row.node.querySelector<HTMLElement>('.change-summary');if(!summary)continue;const text=(row.id===first.id&&headline?summary.dataset.rest:summary.dataset.full)||'';summary.textContent=text;summary.hidden=!text;}
    const latest=el.querySelector('.latest-change'),history=el.querySelector('.change-history .fold-body');
    if(latest&&history){for(const row of rows)(row.id===first.id?latest:history).append(row.node);const fold=el.querySelector<HTMLElement>('.change-history')!;fold.hidden=selected.length<2;fold.querySelector('summary')!.textContent=w(`本范围另有 ${selected.length-1} 次变化`,`${selected.length-1} more changes in this range`);}
    const label=el.querySelector('.change-kind');if(label)label.textContent=first.kind==='new'?w('新事件','New'):first.kind==='trend'?w('趋势变化','Trend'):['correction','recommendation'].includes(first.kind)?w('判断变化','Judgment change'):w('重要更新','Update');
    const isEssential=selected.some((r:any)=>r.highlight)&&essential++<5;
    el.classList.toggle('essential',isEssential);
    const labels=JSON.parse(el.dataset.followLabels||'{}');
    const matchedLabels=keys.filter(key=>state.follows.includes(key)).map(key=>labels[key]||key).slice(0,2).join(' · ');
    const reason=el.querySelector('.feed-reason');if(reason)reason.textContent=feed.dataset.following==='true'?(follows?w(`关注：${matchedLabels}`,`Following: ${matchedLabels}`):w('全局重大变化','Major development')):isEssential?w('必读','Essential'):'';
    for(const note of el.querySelectorAll<HTMLElement>('.editor-note'))note.hidden=!isEssential;
    if(!el.hidden)visibleIds.push(...selected.map((r:any)=>r.id));
   }
   feed.querySelector(feed.dataset.following==='true'&&!follows?'.global-feed-items':'.feed-items')!.append(el);
  }
  feed.querySelectorAll<HTMLButtonElement>('[data-range]').forEach(b=>{const active=b.dataset.range===range;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  const empty=feed.querySelector<HTMLElement>('.feed-empty');if(empty)empty.hidden=matched>0;
  const more=feed.querySelector<HTMLElement>('.feed-more');if(more)more.hidden=matched<=count;
  const globalSection=feed.querySelector<HTMLElement>('.global-feed-items');if(globalSection)globalSection.hidden=!globalSection.querySelector('[data-feed-item]:not([hidden])');
  const end=feed.querySelector<HTMLElement>('.reading-end');if(end)end.hidden=matched===0;
  const counter=feed.querySelector('.feed-count');if(counter)counter.textContent=`${Math.min(matched,count)} / ${matched} ${w('项变化','stories')}${date?' · '+date:range==='latest'&&feed.dataset.latestDate?' · '+feed.dataset.latestDate:''}`;
  return matched;
 }
 feed.querySelectorAll<HTMLButtonElement>('[data-range]').forEach(b=>b.addEventListener('click',()=>{range=b.dataset.range!;date=undefined;count=10;apply();}));
 feed.querySelector('.feed-more')?.addEventListener('click',()=>{count+=10;apply();});
 feed.querySelector('[data-complete]')?.addEventListener('click',()=>{state={...state,read:[...new Set([...state.read,...visibleIds])],completed_version:feed.dataset.version};persist();announce(w('已记住以上内容。后续新增变化仍会显示。','This page is marked read. Subsequent changes will still appear.'));});
 window.addEventListener('matrix:reader',apply);
 // An automatically chosen range must never open on an empty page.
 if(apply()===0&&!explicit&&!date&&range!=='latest'){range='latest';apply();}
}
// Personal controls operate on explicit actions only; imports are validated before replacement.
document.getElementById('export-reader')?.addEventListener('click',()=>{
 const link=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));link.href=url;link.download='matrix-reading.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
document.getElementById('import-reader')?.addEventListener('change',async ev=>{
 const input=ev.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;
 try {if(file.size>5_000_000)throw Error('too large');const next=normalizeState(JSON.parse(await file.text()));state=normalizeState({...next,follows:[...new Set([...state.follows,...next.follows])],bookmarks:[...new Set([...state.bookmarks,...next.bookmarks])],read:[...new Set([...state.read,...next.read])]});persist();announce(w('已合并导入的阅读记录。','Imported reading data has been merged.'));}catch{announce(w('导入失败：文件格式不正确。现有记录未变更。','Import failed: invalid format. Existing data is unchanged.'));}input.value='';
});
document.getElementById('clear-reader')?.addEventListener('click',()=>{
 if(confirm(w('清空此浏览器中的关注、收藏和已读记录？','Clear follows, bookmarks and read history in this browser?'))){state=emptyState();persist();announce(w('本地阅读记录已清空。','Local reading data cleared.'));}
});
