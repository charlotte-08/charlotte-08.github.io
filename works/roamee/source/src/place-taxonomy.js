export const TAXONOMY_VERSION = 1;
const registry = entries => Object.freeze(entries.map((entry,index)=>Object.freeze({active:true,sortOrder:index+1,...entry})));

export const NOW_THEME_OPTIONS = registry([
  {id:"emotional-healing",label:"情感療癒"},{id:"personal-growth",label:"個人成長"},{id:"trends",label:"潮流趨勢"},{id:"food",label:"美食饕餮"},{id:"arts-culture",label:"文化藝術"},{id:"music",label:"音樂素養"},{id:"games",label:"遊戲娛樂"},{id:"science",label:"科學探索"},{id:"puzzles",label:"動腦推理"},{id:"nature",label:"自然環境"},{id:"urban-exploration",label:"城市探索"},{id:"riverside",label:"河岸漫遊"},{id:"spirituality",label:"求神拜佛"}
]);

export const SURPRISE_TAG_OPTIONS = registry([
  {id:"playful-random",label:"XDDD"},{id:"no-preference",label:"什麼想法也沒有"},{id:"popular",label:"熱門"},{id:"new",label:"新穎"},{id:"pure-rest",label:"什麼都不用做只要休息的"},{id:"extreme-challenge",label:"挑戰極限"},{id:"introvert-friendly",label:"社恐必去"},{id:"trendy",label:"潮流酷炫"},{id:"must-visit",label:"不能不去的！"},{id:"dog-friendly",label:"狗狗友善"},{id:"family-trip",label:"家庭旅遊"},{id:"high-energy",label:"爆汗"},{id:"photo-spot",label:"網紅打卡點"},{id:"queue-friendly",label:"排隊也可以"},{id:"budget-friendly",label:"月底沒錢了"}
]);

export const NOW_THEMES = NOW_THEME_OPTIONS.filter(item=>item.active).sort((a,b)=>a.sortOrder-b.sortOrder).map(item=>item.label);
export const SURPRISE_TAGS = SURPRISE_TAG_OPTIONS.filter(item=>item.active).sort((a,b)=>a.sortOrder-b.sortOrder).map(item=>item.label);
export const taxonomyId = (value,options) => options.find(item=>item.id===value||item.label===value)?.id??null;
export const taxonomyLabel = (value,options) => options.find(item=>item.id===value||item.label===value)?.label??null;
export const taxonomyIds = (values,options) => [...new Set((Array.isArray(values)?values:[values]).filter(Boolean).map(value=>taxonomyId(value,options)).filter(Boolean))];

export function validateTaxonomy(options) {
  const errors=[];const ids=new Set();const labels=new Set();const orders=new Set();
  for(const item of options){
    if(!item.id||!item.label)errors.push("分類項目必須有 id 與 label");
    if(ids.has(item.id))errors.push(`分類 id 重複：${item.id}`);ids.add(item.id);
    if(labels.has(item.label))errors.push(`分類名稱重複：${item.label}`);labels.add(item.label);
    if(orders.has(item.sortOrder))errors.push(`分類排序重複：${item.sortOrder}`);orders.add(item.sortOrder);
  }
  return {valid:errors.length===0,errors};
}

export const NEARBY_CATEGORIES = ["餐廳", "逛街", "點心", "電影", "美術館", "購物", "飲品", "美妝", "遊樂場"];

export const PLAN_THEMES = ["老城區探索", "擼貓", "網美打卡牆", "公路之旅", "海濱風光", "文青探店", "踏青", "在地探索", "夏天吹冷氣", "沒衣服穿了", "夜景"];

export const PLACE_ENUMS = Object.freeze({
  status:["draft","published","archived"],
  indoorOutdoor:["indoor","outdoor","mixed"],
  socialEnergy:["solo","low","medium","high"],
  activityLevel:["rest","light","moderate","intense"],
  crowdLevel:["quiet","normal","busy"],
  queueLikelihood:["low","medium","high"],
  partyTypes:["solo","couple","friends","family","seniors"],
  weatherSuitability:["sunny","rainy","hot","cold"],
  timeSlots:["early-morning","morning","noon","afternoon","evening","night"],
  mealTypes:["breakfast","brunch","lunch","afternoon-tea","dinner","late-night"],
  transportAccess:["walk","bicycle","scooter","car","bus","metro","train","high-speed-rail"]
});
