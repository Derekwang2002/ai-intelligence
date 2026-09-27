import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');const base=(process.env.ASTRO_BASE||'').replace(/\/$/,'');
async function walk(dir){const out=[];for(const ent of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())out.push(...await walk(p));else if(p.endsWith('.html'))out.push(p);}return out;}
const missing=[];let checked=0;
for(const file of await walk(root)){
 const html=await readFile(file,'utf8');
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const raw=match[1].replaceAll('&amp;','&');if(/^(https?:|mailto:|data:|tel:)/.test(raw))continue;
  const url=new URL(raw,`https://matrix.invalid${base}/${path.relative(root,file).replace(/index\.html$/,'')}`);
  if(!url.pathname.startsWith(base+'/')&&url.pathname!==base){missing.push(`${path.relative(root,file)}: outside base ${raw}`);continue;}
  let target=path.join(root,decodeURIComponent(url.pathname.slice(base.length)));
  if(target.endsWith(path.sep))target=path.join(target,'index.html');
  try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);}catch{missing.push(`${path.relative(root,file)}: missing ${raw}`);}checked++;
 }
}
if(missing.length){console.error(missing.slice(0,30).join('\n'));throw Error(`${missing.length} broken internal links`);}
console.log(`Verified ${checked} internal links/assets with base ${base||'/'}.`);
