import type {APIRoute} from 'astro';
import {feedXml,rss} from '../lib/feeds';
export const GET:APIRoute=({site})=>rss(feedXml({type:'all'},'zh',site!));
