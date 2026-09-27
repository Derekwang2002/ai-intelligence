import data from '../data/generated/intelligence.json';
export const intel:any=data;
export const pick=(object:any,key:string,locale:string)=>object?.[`${key}_${locale}`]??object?.[`${key}_en`]??'';
export const words=(locale:string,zh:string,en:string)=>locale==='zh'?zh:en;
export const sourceById=(id:string)=>intel.sources.find((s:any)=>s.id===id);
export const sourceLabels:any={announcement:['公告','Announcement'],release:['发布说明','Release notes'],documentation:['文档','Documentation'],code:['代码','Code'],weights:['模型权重','Weights'],paper:['论文','Paper'],evaluation:['评测','Evaluation'],community:['社区反馈','Community'],reference:['参考材料','Reference']};
export const sourceLabel=(kind:string,locale:string)=>(sourceLabels[kind]||sourceLabels.reference)[locale==='zh'?0:1];
export const stageLabel=(stage:string,locale:string)=>words(locale,stage==='frontier'?'前沿观察':stage==='legacy'?'历史待核实':'已核实动态',stage==='frontier'?'Frontier watch':stage==='legacy'?'Unreviewed archive':'Verified announcement');
export const changeLabel=(kind:string,locale:string)=>({new:words(locale,'新事件','New'),update:words(locale,'重要更新','Update'),recommendation:words(locale,'建议调整','Recommendation'),correction:words(locale,'判断修正','Correction'),trend:words(locale,'趋势变化','Trend')})[kind]||kind;

export const trendStatus=(status:string,locale:string)=>locale==='en'?status:({candidate:'候选',emerging:'正在形成',strengthening:'持续增强',established:'已确立',weakening:'减弱',invalidated:'已失效'}[status]||status);
export const confidenceLabel=(value:string,locale:string)=>locale==='en'?value:({High:'高',Medium:'中',Low:'低'}[value]||value);
