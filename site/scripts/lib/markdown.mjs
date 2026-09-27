import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
marked.setOptions({gfm:true,breaks:false});
export function renderMarkdown(md) {
 return sanitizeHtml(marked.parse(md),{
  allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','details','summary'],
  allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,a:['href','target','rel','title'],img:['src','alt','title','width','height'], '*':['id'],td:['colspan','rowspan'],th:['colspan','rowspan']},
  allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,
  transformTags:{a:(tagName,attrs)=>({tagName,attribs:/^https?:\/\//.test(attrs.href||'')?{...attrs,target:'_blank',rel:'noopener noreferrer',title:attrs.title||'外部来源 · Opens in a new tab'}:attrs})},
 });
}
