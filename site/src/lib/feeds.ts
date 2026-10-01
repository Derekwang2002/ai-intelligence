// Feed assembly: the same material changes as the home feed, newest discovery first.
import {intel,pick,words,changeLabel,sourceById} from './intelligence';
import {u} from './url';
import {buildRss,xml} from './feed.mjs';
import {splitLead} from './reader-store.mjs';
import type {Locale} from './i18n';

export type FeedScope={type:'all'}|{type:'project'|'scenario';id:string};
const LIMIT={all:50,project:30,scenario:30};
const highlights=new Map(intel.briefings.filter((b:any)=>!b.baseline).flatMap((b:any)=>b.highlights.map((h:any)=>[h.change_id,h])));

export function feedPath(scope:FeedScope,locale:Locale){
 return u(scope.type==='all'?'/feed.xml':`/feeds/${scope.type}s/${scope.id}.xml`,locale);
}

function scopeTitle(scope:FeedScope,locale:Locale){
 if(scope.type==='all')return words(locale,'MATRIX AI 情报','MATRIX AI intelligence');
 const item=scope.type==='project'?intel.projects.find((p:any)=>p.id===scope.id):intel.scenarios.find((s:any)=>s.id===scope.id);
 return `MATRIX · ${pick(item,'name',locale)}`;
}

function itemFor(c:any,locale:Locale,site:URL){
 const summary=pick(c,'summary',locale),title=pick(c,'title',locale);
 const headline=c.kind==='new'?title:splitLead(summary)[0];
 const reason=highlights.get(c.id) as any;
 const sources=(c.source_ids||[]).slice(0,3).map(sourceById).filter(Boolean);
 const html=[
  `<p>${xml(summary)}</p>`,
  c.kind!=='new'?`<p>${words(locale,'原条目：','Original story: ')}${xml(title)}</p>`:'',
  reason?`<p><strong>${words(locale,'为什么读：','Why read: ')}</strong>${xml(pick(reason,'reason',locale))}</p>`:'',
  c.recommendation?`<p>${words(locale,'建议等级：','Recommendation: ')}${xml(c.recommendation)}</p>`:'',
  sources.length?`<p>${words(locale,'来源：','Sources: ')}${sources.map((s:any)=>`<a href="${xml(s.url)}">${xml(s.title)}</a>`).join(' · ')}</p>`:'',
 ].join('');
 return {title:headline,link:new URL(u(c.path,locale),site).href,guid:c.id,date:c.discovered_at,categories:[changeLabel(c.kind,locale),...(c.recommendation?[c.recommendation]:[])],description:html};
}

export function feedXml(scope:FeedScope,locale:Locale,site:URL){
 const changes=intel.changes.filter((c:any)=>scope.type==='all'||(scope.type==='project'?c.project_ids:c.scenario_ids).includes(scope.id));
 return buildRss({
  title:scopeTitle(scope,locale),
  description:words(locale,'AI 模型、Agent、工程与基础设施的重要变化，附一手来源与建议等级。','Material changes in AI models, agents, engineering and infrastructure, with primary sources and recommendations.'),
  link:new URL(u(scope.type==='project'?`/projects/${scope.id}/`:'/',locale),site).href,
  self:new URL(feedPath(scope,locale),site).href,
  language:locale==='zh'?'zh-CN':'en',
  updated:intel.as_of,
  items:changes.slice(0,LIMIT[scope.type]).map((c:any)=>itemFor(c,locale,site)),
 });
}

export const rss=(body:string)=>new Response(body,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
