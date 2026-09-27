export const STORAGE_KEY='matrix-reader-v1';
export const emptyState=()=>({version:1,follows:[],bookmarks:[],read:[],completed_version:null});
export function normalizeState(value) {
 if(!value || value.version!==1)throw new Error('Unsupported reading data');
 const result=emptyState();
 for(const key of ['follows','bookmarks','read']){
  if(!Array.isArray(value[key])||value[key].length>50000||value[key].some(x=>typeof x!=='string'||x.length>250))throw new Error(`Invalid ${key}`);
  result[key]=[...new Set(value[key])];
 }
 if(value.completed_version!==null && (typeof value.completed_version!=='string'||value.completed_version.length>100))throw new Error('Invalid version');
 result.completed_version=value.completed_version;
 return result;
}
export function loadState(storage) {
 try {const value=storage.getItem(STORAGE_KEY);return {state:value?normalizeState(JSON.parse(value)):emptyState(),available:true};}
 catch {return {state:emptyState(),available:false};}
}
export function saveState(storage,state){try {storage.setItem(STORAGE_KEY,JSON.stringify(normalizeState(state)));return true;}catch{return false;}}
export function toggleValue(state,key,value) {return {...state,[key]:state[key].includes(value)?state[key].filter(v=>v!==value):[...state[key],value]};}
export function selectChanges(changes,{range='today',today,read=[],date}) {
 const week=new Date(`${today}T00:00:00Z`);week.setUTCDate(week.getUTCDate()-6);
 const start=week.toISOString().slice(0,10);
 return changes.filter(c=>range==='unread'?!c.historical&&!read.includes(c.id):range==='week'?c.date>=start&&c.date<=today:c.date===(date||today));
}
