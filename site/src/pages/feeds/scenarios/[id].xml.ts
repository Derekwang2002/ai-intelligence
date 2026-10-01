import type {APIRoute} from 'astro';
import {intel} from '../../../lib/intelligence';
import {feedXml,rss} from '../../../lib/feeds';
export function getStaticPaths(){return intel.scenarios.map((item:any)=>({params:{id:item.id}}));}
export const GET:APIRoute=({params,site})=>rss(feedXml({type:'scenario',id:params.id!},'zh',site!));
