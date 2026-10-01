import type {APIRoute} from 'astro';
import {intel} from '../../../../lib/intelligence';
import {feedXml,rss} from '../../../../lib/feeds';
export function getStaticPaths(){return intel.projects.map((item:any)=>({params:{id:item.id}}));}
export const GET:APIRoute=({params,site})=>rss(feedXml({type:'project',id:params.id!},'en',site!));
