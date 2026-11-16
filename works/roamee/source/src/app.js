import { places, themes, surpriseTags } from "./data.js?v=20260822v";
import { icon, menuIcon, themeCheckIcon, ctaArrowIcon, closeIcon, linkIcon, toastCheckIcon, chipCloseIcon, sheetAddIcon, kickPersonIcon, moreIcon, visibilityIcon, addIcon, heartIcon } from "./icons.js?v=20260822m";
import { uiButton } from "./components.js?v=20260822m";

const app = document.querySelector("#app");
const defaultPlanSearchHistory=["咖啡不限時","夜間營業","忠孝新生","慶生","挑禮物"];
function loadSavedPlans(){try{const saved=JSON.parse(localStorage.getItem("roamee.savedPlans"));return Array.isArray(saved)?saved:[];}catch{return [];}}
function saveSavedPlans(){try{localStorage.setItem("roamee.savedPlans",JSON.stringify(state.savedPlans));}catch{}}
function loadPlanSearchHistory(){try{const saved=JSON.parse(localStorage.getItem("roamee.planSearchHistory"));return Array.isArray(saved)?saved.slice(0,5):[...defaultPlanSearchHistory];}catch{return [...defaultPlanSearchHistory];}}
function savePlanSearchHistory(){try{localStorage.setItem("roamee.planSearchHistory",JSON.stringify(state.planSearchHistory));}catch{}}
function rememberPlanSearch(query){const value=query.trim();if(!value)return;state.planSearchHistory=[value,...state.planSearchHistory.filter(item=>item!==value)].slice(0,5);savePlanSearchHistory();}
const state = { screen:"now", theme:"情感療癒", selectedTags:[], detail:null, detailTab:"intro", detailImage:0, favorites:["garden91","ice-land","beitou-library","boardgame","botanical-garden","bremen"], discoverIndex:0, discoverTheme:"餐廳", surpriseIds:null, menuPage:null, reviewOpen:false, openFaq:null, pendingFavorite:null, profile:{name:"Nina",address:"新北市板橋區長江路一段七號"}, passwordVisible:{profile:false,old:false,new:false,confirm:false}, settings:{notifications:true,location:true}, transports:[], savedPlans:loadSavedPlans(), planThemes:[], planSettingsOpen:false, planDraft:null, planLimitOpen:false, planSearchOpen:false, planSearchContext:"setup", planSearchQuery:"", planSearchHistory:loadPlanSearchHistory(), planAddedPlaces:[], planHour:9, planMinute:0, planBudget:9999, planSetupOpen:false, planItineraryOpen:false, planReturnToTrips:false, planTeamSettingsOpen:false, planTeamDraft:null, planKikiIncluded:true, planBlockedRemoval:null, planBudgetOnlyOpen:false, planPendingAddPlace:null, planItineraryPlaces:[], planStops:null, planStopOpen:null, planExpandedRecommendation:null, planName:"", planInviteEmail:"", planCollaborators:[], planRemoveCandidate:null, planAddSheetOpen:false, planAddDraft:[] };
const escapeAttribute=value=>String(value).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const priceText = value => ["免費","$","$$","$$$"][value] ?? "";
const nearbyThemes=["餐廳","逛街","點心","電影","美術館","購物","飲品","美妝","遊樂場"];

function header(title, subtitle="掌握出遊衝動") {
  return `<header class="topbar"><div class="topbar__row"><span class="brand">ROAMEE</span><button class="icon-btn" data-action="theme" aria-label="切換亮暗模式">◐</button></div><div><div class="page-title">${title}</div><small>${subtitle}</small></div></header>`;
}

function mainHeader() {
  return `<header class="now-header"><div class="now-header__bar">
    <button class="figma-icon menu-button" data-action="menu" aria-label="開啟選單">${menuIcon()}</button>
    <div class="figma-logo" aria-label="ROAMEE"><span>ROA</span><b>ME</b><span>E</span></div>
  </div></header>`;
}

function tabs() {
  return `<nav class="tabbar" aria-label="主要功能"><div class="tabbar__inner">
    <button class="tab ${state.screen==="now"?"is-active":""}" data-screen="now">現在去哪</button>
    <button class="tab ${state.screen==="nearby"?"is-active":""}" data-screen="nearby">探索周遭</button>
    <button class="tab ${state.screen==="plan"?"is-active":""}" data-screen="plan">一日規劃</button>
  </div></nav>`;
}

function card(place, className="") {
  return `<button class="place-card ${className}" data-place="${place.id}" aria-label="查看 ${place.name}">
    <img src="${place.image}" alt="${place.name}" />
    <span class="place-card__body"><h3>${place.name}</h3><span class="meta"><span>${place.area}</span><span>${place.distance} km</span><span>${priceText(place.price)}</span></span></span>
  </button>`;
}

function nowScreen() {
  const filtered = places.filter(p => (state.surpriseIds ? state.surpriseIds.includes(p.id) : p.classification.nowThemes.includes(state.theme)));
  return `<section class="screen now-screen">${mainHeader()}
    ${state.surpriseIds ? `<div class="result-note">依照你的 Surprise 標籤推薦 ${filtered.length} 個地點。<button class="secondary-btn" data-action="clear-surprise">回到主題</button></div>` : ""}
    <div class="theme-layout"><aside class="theme-sidebar" aria-label="主題"><button class="surprise-entry" data-action="surprise" aria-label="開啟 Surprise 篩選">${icon("surprise",{alt:"SURPRISE"})}</button><div class="theme-rail">${themes.map(t=>`<button class="theme-btn ${t===state.theme&&!state.surpriseIds?"is-active":""}" data-theme-name="${t}">${t}</button>`).join("")}</div></aside>
    <div class="card-list">${filtered.length?filtered.map(p=>card(p)).join(""):`<p class="empty">沒有完全符合的地點，換一組條件試試看。</p>`}</div></div>
    ${tabs()}</section>`;
}

function nearbyPool(){
  const ids={餐廳:["kingyo","pastaio","bremen"],逛街:["44-village","old-town"],點心:["diy-baking","bremen"],電影:["music-center","44-village"],美術館:["garden91","science-center"],購物:["old-town","44-village"],飲品:["bremen","garden91"],美妝:["44-village","old-town"],遊樂場:["ice-land","boardgame","puzzle-room"]}[state.discoverTheme]||[];
  const matches=ids.map(id=>places.find(p=>p.id===id)).filter(Boolean);
  return matches.length?matches:places.slice(0,3);
}

function nearbyCard(place,offset){
  const distance=Math.round(place.distance*1000);
  const average=place.averageCost??[0,200,500,650][place.price]??0;
  const position=offset<0?"is-prev":offset>0?"is-next":"is-current";
  const english=/^[\x00-\x7F\s]+$/.test(place.name);
  return `<button class="nearby-card ${position}" data-nearby-offset="${offset}" data-place="${place.id}" aria-label="查看 ${place.name}"><img class="nearby-card__image" src="${place.image}" alt="${place.name}" draggable="false" /><span class="nearby-card__shade"><span class="nearby-card__title ${english?"is-en":""}">${place.name}</span><span class="nearby-card__details"><span class="nearby-card__description">${place.description}</span><span class="nearby-card__meta"><span>距離 <strong>${distance}</strong> <i>m</i></span><b>/</b><span>均消 <i>$</i> <strong>${average}</strong></span></span><span class="nearby-card__booking">${place.reservationRequired?"可訂位":"不可訂位"}</span></span></span></button>`;
}

function nearbyScreen() {
  const pool=nearbyPool();
  const total=pool.length;
  const current=((state.discoverIndex%total)+total)%total;
  const cards=[-1,0,1].map(offset=>nearbyCard(pool[(current+offset+total)%total],offset)).join("");
  return `<section class="screen now-screen nearby-screen">${mainHeader()}<div class="nearby-layout"><aside class="nearby-sidebar" aria-label="探索主題">${nearbyThemes.map(theme=>`<button class="nearby-theme ${theme===state.discoverTheme?"is-active":""}" data-nearby-theme="${theme}">${theme}</button>`).join("")}</aside><div class="nearby-stage" data-nearby-stage>${cards}</div></div>${tabs()}</section>`;
}

const planThemeColumns=[
  [{name:"老城區探索",image:"assets/figma/plan-theme-01.jpg",height:120},{name:"擼貓",image:"assets/figma/plan-theme-02.jpg",height:128},{name:"網美打卡牆",image:"assets/places/place-03.jpeg",height:88},{name:"公路之旅",image:"assets/figma/plan-theme-04.jpg",height:104},{name:"海濱風光",image:"assets/figma/plan-theme-05.jpg",height:132}],
  [{name:"文青探店",image:"assets/figma/plan-theme-08.jpg",height:140},{name:"踏青",image:"assets/figma/plan-theme-09.jpg",height:96},{name:"在地探索",image:"assets/figma/plan-theme-10.jpg",height:112},{name:"夏天吹冷氣",image:"assets/figma/plan-theme-11.jpg",height:120},{name:"沒衣服穿了",image:"assets/figma/plan-theme-12.jpg",height:92}]
];

function planThemeCard(theme){
  const selected=state.planThemes.includes(theme.name);
  return `<button class="plan-theme-card ${selected?"is-selected":""}" style="height:${theme.height}px" data-plan-theme="${theme.name}" aria-pressed="${selected}"><img class="plan-theme-image" src="${theme.image}" alt="" /><span class="plan-theme-shade"><b>${theme.name}</b>${themeCheckIcon(selected)}</span></button>`;
}

function planCta(extraClass=""){
  const count=state.planThemes.length+state.planAddedPlaces.length;
  return `<button class="plan-cta ${count?"is-ready":""} ${extraClass}" data-action="start-plan"><span class="plan-cta__copy"><i>${count}</i><b>個主題已選擇，開始規劃</b></span>${ctaArrowIcon()}</button>`;
}

function planSettingsSheet(){
  const pad=value=>String(value).padStart(2,"0");
  const draft=state.planDraft??{hour:state.planHour,minute:state.planMinute,budget:state.planBudget};
  const budgetText=draft.budget>=9999?"9999+":draft.budget.toLocaleString("en-US");
  const progress=(draft.budget/9999)*100;
  return `<div class="plan-modal-layer" data-action="close-plan-settings"><section class="plan-settings-sheet" data-plan-settings role="dialog" aria-modal="true" aria-label="時間與預算"><header><button class="plan-close" data-action="close-plan-settings" aria-label="關閉">${closeIcon()}</button></header><div class="plan-settings-body"><section><h2>出發時間</h2><div class="plan-clock"><div class="plan-clock-group"><div class="plan-number" data-plan-wheel="hour"><button data-plan-adjust="hour-down" aria-label="出發時間減少一小時">${icon("timerUp")}</button><strong>${pad(draft.hour)}</strong><button data-plan-adjust="hour-up" aria-label="出發時間增加一小時">${icon("timerDown")}</button></div><span>時</span></div><div class="plan-clock-group"><div class="plan-number" data-plan-wheel="minute"><button data-plan-adjust="minute-down" aria-label="出發時間減少三十分鐘">${icon("timerUp")}</button><strong>${pad(draft.minute)}</strong><button data-plan-adjust="minute-up" aria-label="出發時間增加三十分鐘">${icon("timerDown")}</button></div><span>分</span></div></div></section><section class="plan-budget"><h2>預算範圍</h2><div class="plan-budget-row"><div class="plan-budget-slider" style="--budget-progress:${progress}%"><span class="plan-budget-track" aria-hidden="true"></span><span class="plan-budget-thumb" aria-hidden="true"><i></i><i></i></span><input type="range" min="0" max="9999" step="1" value="${draft.budget}" data-plan-budget aria-label="預算上限" /></div><label><span>上限</span><input class="plan-budget-input" type="text" inputmode="numeric" pattern="[0-9]*" value="${budgetText}" data-plan-budget-input aria-label="直接輸入預算上限" /></label></div></section></div><footer><button class="primary-btn" data-action="confirm-plan-settings">確認</button></footer></section></div>`;
}

function planLimitDialog(){
  return `<div class="plan-limit-layer" data-action="close-plan-limit"><section class="plan-limit-dialog" role="alertdialog" aria-modal="true" aria-labelledby="plan-limit-title" data-plan-limit-dialog><div class="plan-limit-dialog__copy"><h2 id="plan-limit-title">最多只能加入三個主題</h2><div class="plan-limit-dialog__body"><p>我們會根據您選擇的主題推薦景點，但推薦內容不一定能符合所有主題。當您選擇的主題太多，反而可能讓推薦結果不如您的預期。</p><p>若您要在行程新增更多景點，請在開始規劃行程後再行加入。</p></div></div><footer><button data-action="close-plan-limit">我知道了</button></footer></section></div>`;
}

const availablePlanThemes=[...new Set(planThemeColumns.flat().map(item=>item.name))];
function selectedPlanItems(){return [...state.planThemes.map(id=>({kind:"theme",id,name:id})),...state.planAddedPlaces.map(id=>{const place=places.find(item=>item.id===id);return {kind:"place",id,name:place?.name??id};})];}
function setupChipsMarkup(){return selectedPlanItems().map(item=>`<button data-plan-remove-kind="${item.kind}" data-plan-remove-id="${item.id}" title="${item.name}"><span>${item.name}</span>${chipCloseIcon()}</button>`).join("");}
function planRemoveDialog(){return `<div class="plan-remove-layer" data-action="close-plan-remove"><section class="plan-remove-dialog" data-plan-remove-dialog role="alertdialog" aria-modal="true" aria-labelledby="plan-remove-title"><div><h2 id="plan-remove-title">是否移除主題條件？</h2></div><footer><button data-action="close-plan-remove">取消</button><button class="is-danger" data-action="confirm-plan-remove">移除</button></footer></section></div>`;}
function planAddSheet(){
  const currentThemes=state.planTeamDraft?.themes??state.planThemes;
  const remaining=availablePlanThemes.filter(theme=>!currentThemes.includes(theme));
  return `<div class="plan-add-layer" data-action="close-plan-add-sheet"><section class="plan-add-sheet" data-plan-add-sheet role="dialog" aria-modal="true" aria-label="新增主題"><header><button data-action="close-plan-add-sheet" aria-label="關閉">${closeIcon()}</button></header><div class="plan-add-sheet__body"><h2>新增主題</h2><div class="plan-add-options">${remaining.map(theme=>`<button class="${state.planAddDraft.includes(theme)?"is-selected":""}" data-plan-add-theme="${theme}" aria-pressed="${state.planAddDraft.includes(theme)}">${sheetAddIcon()}<span>${theme}</span></button>`).join("")}</div></div><footer>${uiButton("確認",{variant:"primary",width:"full",action:"confirm-plan-add-sheet"})}</footer></section></div>`;
}
function planSetupScreen(){
  const items=selectedPlanItems();
  const collaborators=state.planCollaborators.map(email=>`<div class="plan-collaborator is-pending"><img src="assets/figma/invite-avatar.png" alt="" /><span><b>邀請中</b><small>${email}</small></span><button class="plan-kick-person" data-remove-plan-collaborator="${email}" aria-label="移除 ${email}">${kickPersonIcon()}</button></div>`).join("");
  return `<section class="plan-setup-screen"><header class="plan-setup-nav"><button class="detail-icon" data-action="close-plan-setup" aria-label="返回">${icon("back")}</button><h1>新增一日規劃行程</h1></header><main class="plan-setup-body"><section class="plan-setup-section"><h2>行程名稱</h2><input class="plan-name-input" data-plan-name value="${state.planName}" placeholder="請輸入行程名稱" /></section><section class="plan-setup-section plan-collaboration"><header><h2>共編對象</h2><button class="plan-copy-link" data-action="copy-plan-link">${linkIcon()}<span>複製連結</span></button></header><div class="plan-collaborators"><div class="plan-collaborator is-self"><img src="assets/figma/profile-avatar.png" alt="Nina" /><span><b>Nina</b><small>nina930521@gmail.com</small></span></div>${collaborators}</div><div class="plan-invite"><input data-plan-invite value="${state.planInviteEmail}" inputmode="email" placeholder="新增成員、email......" />${uiButton("新增",{variant:"secondary",action:"add-plan-collaborator"})}</div></section><section class="plan-setup-section plan-selected"><header><h2>已選擇的主題</h2><button class="plan-open-add" data-action="open-plan-add-sheet">新增</button></header><div class="plan-selected-chips">${items.map(item=>`<button data-plan-remove-kind="${item.kind}" data-plan-remove-id="${item.id}" title="${item.name}"><span>${item.name}</span>${chipCloseIcon()}</button>`).join("")}</div><p class="plan-selected-note">您選擇的主題主要用於主要用於推薦符合條件的景點與行程。若您選擇景點，則會直接加入您的行程中。在行程安排中，您可以隨時變更主題條件，並不會影響已經加入行程的景點。</p></section></main><footer class="plan-setup-footer">${uiButton("下一步",{variant:"primary",width:"full",action:"plan-setup-next",disabled:!state.planName.trim()})}</footer>${state.planRemoveCandidate?planRemoveDialog():""}${state.planAddSheetOpen?planAddSheet():""}${state.planLimitOpen?planLimitDialog():""}</section>`;
}

const itineraryRecommendations=["ice-land","ikea-xinzhuang","fuji-pork","qin-lady","moca","taipei-underground","astronomy-museum"];
function ensurePlanStops(){
  if(state.planStops)return state.planStops;
  const picked=state.planAddedPlaces[0];
  state.planStops=[
    {key:"home-start",id:null,time:"09:30",name:"Nina 住家",address:"新北市板橋區長江路一段七號",home:true,duration:0,approvers:["nina"]},
    ...(picked?[{key:`picked-${picked}`,id:picked,time:"10:30",duration:places.find(place=>place.id===picked)?.duration??90,approvers:["nina"]}]:[])
  ];
  return state.planStops;
}
function stopPlace(stop){return stop.id?places.find(place=>place.id===stop.id):null;}
function stopName(stop){return stop.name??stopPlace(stop)?.name??stop.id;}
function stopAddress(stop){return stop.address??stopPlace(stop)?.address??"地址資訊待確認";}
const itineraryTravelMinutes=[55,7,8,7];
function recalculatePlanStopTimes(stops=ensurePlanStops()){
  if(!stops.length)return;
  let current=stops[0].time?.split(":").reduce((total,value,index)=>total+Number(value)*(index?1:60),0)??state.planHour*60+state.planMinute;
  stops[0].time=`${String(Math.floor(current/60)%24).padStart(2,"0")}:${String(current%60).padStart(2,"0")}`;
  for(let index=1;index<stops.length;index++){
    current+=Math.max(0,Number(stops[index-1].duration)||0)+itineraryTravelMinutes[(index-1)%itineraryTravelMinutes.length];
    current=Math.ceil(current/5)*5;
    stops[index].time=`${String(Math.floor(current/60)%24).padStart(2,"0")}:${String(current%60).padStart(2,"0")}`;
  }
}
function stopAvatars(stop){
  const people=stop.approvers??[];
  return `<span class="itinerary-people">${people.includes("nina")?`<img src="assets/figma/profile-avatar.png" alt="Nina 已附議" />`:""}${people.includes("kiki")?`<img class="is-kiki" src="assets/figma/collaborator-avatar.png" alt="Kiki 已附議" />`:""}</span>`;
}
function joinedStopCard(stop,index,total){
  return `<div class="itinerary-stop ${index===total-1?"is-last":""} ${stop.home?"is-home":"is-draggable"}" data-route-stop="${stop.key}"><span class="itinerary-axis" aria-hidden="true"><i></i></span><button class="itinerary-stop-card" data-open-plan-stop="${stop.key}"><span class="itinerary-stop-copy"><b>${stop.time}</b><strong>${stopName(stop)}</strong><small>${stopAddress(stop)}</small></span>${stopAvatars(stop)}</button></div>`;
}
function transportSegment(index){
  const modes=[{kind:"transit",icon:"transportTransit",time:"55 分鐘",route:"624 → 板南線 → 710"},{kind:"walk",icon:"transportWalk",time:"7 分鐘",route:"南京東路四段 → 健康路，450m"},{kind:"walk",icon:"transportWalk",time:"8 分鐘",route:"健康路 → 南京東路四段，600m"},{kind:"scooter",icon:"transportScooter",time:"7 分鐘",route:"民生東路 → 長安西路，3.5km"}];
  const mode=modes[index%modes.length];
  return `<div class="itinerary-transport"><span aria-hidden="true"></span><div>${icon(mode.icon,{className:"itinerary-transport-icon"})}<span><b>${mode.time}</b><small>${mode.route}</small></span></div></div>`;
}
function recommendationRow(place){
  const expanded=state.planExpandedRecommendation===place.id;
  const sourceImages=place.images?.length?place.images:[place.image];const images=[sourceImages[0],sourceImages[1]??sourceImages[0]];
  return `<div class="itinerary-recommendation ${expanded?"is-expanded":""}"><button class="itinerary-rec-add" data-add-itinerary-recommendation="${place.id}" aria-label="將 ${place.name} 加入行程">${addIcon("plan")}</button><button class="itinerary-rec-body" data-toggle-itinerary-recommendation="${place.id}" aria-expanded="${expanded}"><span class="itinerary-rec-chevron">${expanded?icon("faqDown"):`${icon("faqRightFill")}${icon("faqRightStroke")}`}</span><span class="itinerary-rec-copy"><strong>${place.name}</strong>${expanded?`<small>${place.address}</small><em>${place.description}</em><span class="itinerary-rec-images">${images.map(src=>`<img src="${src}" alt="" />`).join("")}</span>`:""}</span></button></div>`;
}
function stopDetailSheet(){
  const stop=ensurePlanStops().find(item=>item.key===state.planStopOpen);if(!stop)return "";
  const place=stopPlace(stop);if(!place)return "";
  const agreed=stop.approvers.includes("nina");const sourceImages=place.images?.length?place.images:[place.image];const images=[sourceImages[0],sourceImages[1]??sourceImages[0]];
  const hours=String(Math.floor(stop.duration/60)).padStart(2,"0");const minutes=String(stop.duration%60).padStart(2,"0");
  return `<div class="plan-stop-layer" data-action="close-plan-stop"><section class="plan-stop-sheet" data-plan-stop-sheet role="dialog" aria-modal="true"><header><button data-action="close-plan-stop" aria-label="關閉">${closeIcon()}</button></header><div class="plan-stop-body"><button class="plan-stop-title" data-plan-stop-detail="${place.id}"><span>${place.name}</span>${icon("chevronRight")}</button><p>${place.introParagraphs?.[0]??place.description}</p><small>建議停留時長：${place.duration>=60?`${place.duration/60}小時`:`${place.duration}分鐘`}</small><div class="plan-stop-images">${images.map(src=>`<img src="${src}" alt="" />`).join("")}</div>${agreed?`<section class="plan-stop-duration"><h3>停留時間</h3><div class="plan-stop-clock"><div class="plan-stop-clock-group"><div class="plan-number" data-stop-wheel="hour"><button data-stop-adjust="hour-down" aria-label="減少一小時">${icon("timerUp")}</button><strong>${hours}</strong><button data-stop-adjust="hour-up" aria-label="增加一小時">${icon("timerDown")}</button></div><span>時</span></div><div class="plan-stop-clock-group"><div class="plan-number" data-stop-wheel="minute"><button data-stop-adjust="minute-down" aria-label="減少十五分鐘">${icon("timerUp")}</button><strong>${minutes}</strong><button data-stop-adjust="minute-up" aria-label="增加十五分鐘">${icon("timerDown")}</button></div><span>分</span></div></div></section>`:""}</div><footer>${agreed?`${uiButton("刪除行程",{variant:"warning",action:"remove-plan-stop"})}${uiButton("確認修改",{variant:"primary",action:"save-plan-stop"})}`:uiButton("同意加入本行程",{variant:"primary",width:"full",action:"agree-plan-stop"})}</footer></section></div>`;
}
function planTeamStack(){
  const users=[{name:"Nina",image:"assets/figma/profile-avatar.png"},...(state.planKikiIncluded?[{name:"Kiki",image:"assets/figma/collaborator-avatar.png"}]:[]),...state.planCollaborators.map(email=>({name:email,image:"assets/figma/invite-avatar.png"}))];
  const overflow=Math.max(0,users.length-2);
  return `<button class="plan-team-stack" data-action="open-plan-team-settings" aria-label="開啟行程設定">${overflow?`<span class="plan-team-count">+${overflow}</span>`:""}${users[1]?`<img class="is-secondary" src="${users[1].image}" alt="" />`:""}<img class="is-owner" src="${users[0].image}" alt="Nina" /><span class="plan-team-more">${moreIcon()}</span></button>`;
}
function planTeamSettingsSheet(){
  const draft=state.planTeamDraft;
  const items=[...draft.themes.map(id=>({kind:"theme",id,name:id})),...draft.places.map(id=>({kind:"place",id,name:places.find(p=>p.id===id)?.name??id}))];
  const invited=draft.collaborators.map(email=>`<div class="plan-collaborator is-pending"><img src="assets/figma/invite-avatar.png" alt="" /><span><b>邀請中</b><small>${email}</small></span><button class="plan-kick-person" data-remove-team-draft-collaborator="${email}" aria-label="移除 ${email}">${kickPersonIcon()}</button></div>`).join("");
  return `<div class="plan-team-layer" data-action="close-plan-team-settings"><section class="plan-team-sheet" data-plan-team-sheet role="dialog" aria-modal="true" aria-label="行程設定"><header><button data-action="close-plan-team-settings" aria-label="關閉">${closeIcon()}</button></header><div class="plan-team-body"><section class="plan-setup-section"><h2>行程名稱</h2><input class="plan-name-input" data-plan-team-name value="${draft.name}" /></section><section class="plan-setup-section plan-selected"><header><h2>已選擇的主題</h2><button class="plan-open-add" data-action="open-plan-add-sheet">新增</button></header><div class="plan-selected-chips">${items.map(item=>`<button data-plan-draft-remove-kind="${item.kind}" data-plan-draft-remove-id="${item.id}"><span>${item.name}</span>${chipCloseIcon()}</button>`).join("")}</div><p class="plan-selected-note">您選擇的主題主要用於主要用於推薦符合條件的景點與行程。若您選擇景點，則會直接加入您的行程中。在行程安排中，您可以隨時變更主題條件，並不會影響已經加入行程的景點。</p></section><section class="plan-setup-section plan-collaboration"><header><h2>共編對象</h2><button class="plan-copy-link" data-action="copy-plan-link">${linkIcon()}<span>複製連結</span></button></header><div class="plan-collaborators"><div class="plan-collaborator is-self"><img src="assets/figma/profile-avatar.png" alt="Nina" /><span><b>Nina</b><small>nina930521@gmail.com</small></span><button class="plan-kick-person" data-protected-member="nina" aria-label="移除 Nina">${kickPersonIcon()}</button></div>${draft.kikiIncluded?`<div class="plan-collaborator"><img src="assets/figma/collaborator-avatar.png" alt="Kiki" /><span><b>Kiki</b><small>kkkkkkk1k1@gmail.com</small></span><button class="plan-kick-person" data-protected-member="kiki" aria-label="移除 Kiki">${kickPersonIcon()}</button></div>`:""}${invited}</div><div class="plan-invite"><input data-plan-team-invite inputmode="email" placeholder="新增成員、email......" />${uiButton("新增",{variant:"secondary",action:"add-team-draft-collaborator"})}</div></section></div><footer>${uiButton("儲存",{variant:"primary",width:"full",action:"confirm-plan-team-settings"})}</footer></section></div>`;
}
function protectedMemberDialog(kind){const nina=kind==="nina";return `<div class="plan-protected-layer"><section class="plan-protected-dialog" role="alertdialog" aria-modal="true"><div><h2>${nina?"請不要刪除你自己":"請不要刪除你的朋友"}</h2><p>${nina?"在實際使用中，用戶可以替別人開完行程規劃群組後移除自己，但為了讓您順利體驗一日規劃的行程規劃功能，此測試暫不允許您刪除自己。":"在實際使用中，用戶可以自由的管理共編對象，我們會再次向您確認是否移除該位共編者，這是一個不可逆的操作。<br>但為了讓您順利體驗一日規劃的行程規劃共編操作，此測試暫不允許您刪除這位朋友。"}</p></div><footer>${uiButton("我知道了",{variant:"primary",width:"full",action:"close-protected-member"})}</footer></section></div>`;}
function teamDraftChipsMarkup(){const d=state.planTeamDraft;return [...d.themes.map(id=>({kind:"theme",id,name:id})),...d.places.map(id=>({kind:"place",id,name:places.find(p=>p.id===id)?.name??id}))].map(item=>`<button data-plan-draft-remove-kind="${item.kind}" data-plan-draft-remove-id="${item.id}"><span>${item.name}</span>${chipCloseIcon()}</button>`).join("");}
function planBudgetOnlySheet(){
  const draft=state.planDraft??{budget:state.planBudget};
  const budgetText=draft.budget>=9999?"9999+":draft.budget.toLocaleString("en-US");
  return `<div class="plan-modal-layer" data-action="close-plan-budget-only"><section class="plan-budget-only-sheet" data-plan-budget-only role="dialog" aria-modal="true" aria-label="預算範圍"><header><button data-action="close-plan-budget-only" aria-label="關閉">${closeIcon()}</button></header><div class="plan-budget-only-body"><section class="plan-budget"><h2>預算範圍</h2><div class="plan-budget-row"><div class="plan-budget-slider" style="--budget-progress:${draft.budget/9999*100}%"><span class="plan-budget-track"></span><span class="plan-budget-thumb"><i></i><i></i></span><input type="range" min="0" max="9999" step="1" value="${draft.budget}" data-plan-budget aria-label="預算上限" /></div><label><span>上限</span><input class="plan-budget-input" type="text" inputmode="numeric" value="${budgetText}" data-plan-budget-input /></label></div></section></div><footer>${uiButton("確認",{variant:"primary",width:"full",action:"confirm-plan-budget-only"})}</footer></section></div>`;
}
function planAddPlaceDialog(){
  return `<div class="plan-add-place-layer" data-action="close-plan-add-place"><section class="plan-add-place-dialog" data-plan-add-place-dialog role="alertdialog" aria-modal="true"><div><h2>確認將此景點加入行程嗎？</h2></div><footer>${uiButton("取消",{variant:"secondary",action:"close-plan-add-place"})}${uiButton("確認加入",{variant:"primary",action:"confirm-plan-add-place"})}</footer></section></div>`;
}
function planItineraryScreen(){
  const stops=ensurePlanStops();
  const joined=stops.map((stop,index)=>`${joinedStopCard(stop,index,stops.length)}${index<stops.length-1?transportSegment(index):""}`).join("");
  const used=new Set(stops.map(stop=>stop.id));
  const recommendations=itineraryRecommendations.map(id=>places.find(place=>place.id===id)).filter(place=>place&&!used.has(place.id));
  const recommendationList=stops.at(-1)?.home&&stops.length>1?"":`<section class="itinerary-recommendations">${recommendations.map(recommendationRow).join("")}</section>`;
  const hasEndHome=stops.length>1&&stops.at(-1)?.home;
  return `<section class="plan-itinerary-screen"><header class="plan-itinerary-nav"><button class="detail-icon" data-action="close-plan-itinerary" aria-label="返回">${icon("back")}</button><h1>${state.planName}</h1>${planTeamStack()}</header><div class="plan-itinerary-toolbar"><span></span><button data-action="open-plan-budget-only">預算</button><span></span><button data-action="open-itinerary-search">${icon("search")}<b>加入景點或已收藏的內容</b></button><span></span></div><main class="plan-itinerary-body"><div class="itinerary-route">${joined}</div>${recommendationList}</main><footer class="plan-itinerary-footer ${hasEndHome?"is-home-added":""}">${hasEndHome?"":uiButton("回家",{variant:"secondary",action:"add-home-stop"})}${uiButton("儲存",{variant:"primary",action:"save-plan"})}</footer>${state.planTeamSettingsOpen?planTeamSettingsSheet():""}${state.planBudgetOnlyOpen?planBudgetOnlySheet():""}${state.planStopOpen?stopDetailSheet():""}${state.planRemoveCandidate?planRemoveDialog():""}${state.planAddSheetOpen?planAddSheet():""}${state.planLimitOpen?planLimitDialog():""}</section>`;
}

function planAddIcon(){return addIcon("plan");}
function planPlaceRow(place,result=false){
  const added=(state.planSearchContext==="itinerary"?state.planItineraryPlaces:state.planAddedPlaces).includes(place.id);
  return `<div class="plan-place-row ${result?"is-result":""} ${added?"is-added":""}"><button class="plan-place-add" data-add-plan-place="${place.id}">${planAddIcon()}${result?`<img class="plan-result-thumb" src="${place.image}" alt="" />`:""}<span><b>${place.name}</b><small>${place.location.city}${place.area}　NTD ${(place.averageCost??([0,200,500,700][place.price]??0)).toLocaleString("en-US")}</small></span></button><button class="plan-place-detail" data-plan-place-detail="${place.id}" aria-label="查看 ${place.name}">${icon("chevronRight",{className:"plan-place-chevron"})}</button></div>`;
}

function planSearchScreen(){
  const query=state.planSearchQuery.trim();
  const favorites=places.filter(place=>state.favorites.includes(place.id)).slice(0,10);
  const results=query?places.filter(place=>`${place.name}${place.category}${place.description}${place.tags.join("")}`.toLowerCase().includes(query.toLowerCase())).slice(0,7):[];
  const historyContent=state.planSearchHistory.length?`<div class="plan-history__chips">${state.planSearchHistory.map(item=>`<button data-plan-history="${item}">${item}</button>`).join("")}</div>`:`<p class="plan-history__empty">目前沒有搜尋紀錄</p>`;
  const body=query?`<section class="plan-search-section"><h2>搜尋結果</h2><div class="plan-search-results">${results.length?results.map(place=>planPlaceRow(place,true)).join(""):`<p class="plan-search-empty">找不到符合「${query}」的景點。</p>`}</div></section>`:`<section class="plan-history"><header><h2>搜尋紀錄</h2>${state.planSearchHistory.length?`<button data-action="clear-plan-history">清除</button>`:""}</header>${historyContent}</section><div class="plan-search-divider"></div><section class="plan-search-section"><header><h2>我的收藏</h2><button data-action="open-search-favorites">查看更多</button></header><div>${favorites.map(place=>planPlaceRow(place)).join("")}</div></section>`;
  const itineraryMode=state.planSearchContext==="itinerary";
  return `<section class="plan-search-screen"><header class="plan-search-nav"><button class="detail-icon" data-action="close-plan-search" aria-label="返回">${icon("back")}</button><h1>搜尋</h1></header><main class="plan-search-body"><label class="plan-search-input">${icon("search")}<input data-plan-search-input value="${query}" placeholder="請輸入關鍵字" /><button class="plan-search-clear ${query?"":"is-hidden"}" data-action="clear-plan-query" aria-label="清除搜尋">${closeIcon()}</button></label>${body}</main>${itineraryMode?"":planCta("is-search")}${state.planLimitOpen?planLimitDialog():""}${state.planPendingAddPlace?planAddPlaceDialog():""}</section>`;
}

function planScreen() {
  if(state.planSearchOpen) return planSearchScreen();
  if(state.planItineraryOpen) return planItineraryScreen();
  if(state.planSetupOpen) return planSetupScreen();
  return `<section class="screen now-screen plan-screen">${mainHeader()}<div class="plan-toolbar"><span class="plan-toolbar__divider" aria-hidden="true"></span><button class="plan-toolbar__time" data-action="open-plan-settings">時間&amp;預算</button><span class="plan-toolbar__divider" aria-hidden="true"></span><button class="plan-toolbar__add" data-action="open-plan-search">${icon("search")}<span>加入景點或已收藏的內容</span></button><span class="plan-toolbar__divider" aria-hidden="true"></span></div><main class="plan-wall"><p class="plan-hint">選擇1~3個主題，立即開始規劃您的一日出遊行程！</p><div class="plan-masonry">${planThemeColumns.map(column=>`<div>${column.map(planThemeCard).join("")}</div>`).join("")}</div></main>${planCta()}${tabs()}${state.planSettingsOpen?planSettingsSheet():""}${state.planLimitOpen?planLimitDialog():""}</section>`;
}

function detailScreen() {
  const p=places.find(x=>x.id===state.detail);
  const images=p.images?.length?p.images:[p.image];
  const imageIndex=state.detailImage%images.length;
  const favorite=state.favorites.includes(p.id);
  const intro=`<div class="detail-copy">${p.introParagraphs.map(text=>`<p>${text}</p>`).join("")}<p class="image-credit">圖片作者：${p.imageCredit}</p></div>`;
  const comments=`<div class="comment-list">${p.comments.length?p.comments.map(comment=>`<p class="comment">${typeof comment==="string"?comment:comment.text}</p>`).join(""):`<p class="detail-empty">目前還沒有旅客留言。</p>`}</div><button class="review-entry" data-action="open-review">${addIcon("review")}<span>留下您的評論！</span></button>`;
  return `<article class="detail-screen">
    <header class="detail-nav"><div class="detail-nav__title"><button class="detail-icon detail-back" data-action="back" aria-label="返回">${icon("back")}</button><h1 class="${/^[\x00-\x7F\s]+$/.test(p.name)?"is-en":""}" title="${escapeAttribute(p.name)}">${p.name}</h1></div><button class="detail-icon" data-action="favorite" aria-label="${favorite?"取消收藏":"加入收藏"}">${heartIcon(favorite)}</button></header>
    <div class="detail-content"><section class="detail-gallery"><div class="detail-gallery__viewport" data-gallery><div class="detail-gallery__track" style="transform:translateX(-${imageIndex*100}%)">${images.map((image,index)=>`<div class="detail-gallery__slide"><img src="${image}" alt="${p.name} 圖片 ${index+1}" /></div>`).join("")}</div></div><span class="detail-gallery__count">${imageIndex+1} / ${images.length}</span><div class="detail-gallery__bar">${images.map((_,index)=>`<button class="${index===imageIndex?"is-active":""}" data-gallery-index="${index}" aria-label="顯示第 ${index+1} 張圖片"></button>`).join("")}</div></section>
      <section class="detail-info"><div class="detail-tabs" role="tablist"><button class="detail-tab ${state.detailTab==="intro"?"is-active":""}" data-detail-tab="intro" role="tab">景點簡介</button><button class="detail-tab ${state.detailTab==="comments"?"is-active":""}" data-detail-tab="comments" role="tab">旅客留言</button></div><div class="detail-panel">${state.detailTab==="intro"?intro:comments}</div></section>
    </div>${state.reviewOpen?reviewDialog():""}</article>`;
}

function reviewDialog(){
  return `<div class="review-layer" data-action="close-review"><section class="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title" data-review-dialog><header><h2 id="review-title">寫下您的評論</h2><button class="review-close" data-action="close-review" aria-label="關閉">×</button></header><div class="review-body"><textarea aria-label="評論內容" placeholder="寫下您的評論…"></textarea></div><footer><button class="review-cancel" data-action="close-review">取消</button><button class="review-confirm" data-action="submit-review">確認</button></footer></section></div>`;
}

function surpriseSheet() {
  return `<div class="sheet-layer" data-action="close-sheet"><section class="sheet surprise-sheet" role="dialog" aria-modal="true" aria-labelledby="surprise-title" data-sheet>
    <div class="surprise-sheet__close"><button class="icon-btn" data-action="close-sheet" aria-label="關閉">×</button></div>
    <div class="surprise-sheet__body"><div class="surprise-sheet__title"><h2 id="surprise-title">現在想要……</h2><button class="clear-tags" data-action="clear-tags" ${state.selectedTags.length?"":"disabled"}>清除</button></div><div class="tag-grid">${surpriseTags.map(t=>`<button class="chip ${state.selectedTags.includes(t)?"is-selected":""}" data-tag="${t}">${t}</button>`).join("")}</div></div>
    <div class="surprise-sheet__footer"><button class="primary-btn" data-action="run-surprise">確定</button></div></section></div>`;
}

function menuSheet() {
  const groups=[[['收藏庫','favorites'],['未來行程','trips'],['通知','notifications'],['個人資料','profile']],[['設定','settings'],['協助','help'],['隱私聲明','privacy'],['聯絡我們','contact'],['登出','logout']]];
  return `<div class="menu-layer" data-action="close-menu"><aside class="menu-drawer" role="dialog" aria-modal="true" aria-label="選單" data-menu-drawer><img class="menu-avatar" src="assets/figma/menu-image-2.jpeg" alt="使用者頭像" /><nav class="menu-scroll">${groups.map((group,index)=>`${index?`<img class="menu-divider" src="assets/figma/menu-divider.svg" alt="" />`:""}${group.map(([item,page])=>`<button class="menu-item" data-menu-page="${page}">${item}</button>`).join("")}`).join("")}</nav></aside></div>`;
}

const menuTitles={favorites:"收藏庫",trips:"未來行程",notifications:"通知",profile:"個人資料",settings:"設定",help:"協助",privacy:"隱私聲明",contact:"聯絡我們"};
const demoFuturePlans=[
  {id:"demo-summer",name:"夏天吹冷氣",date:"2025/06/26 (Tru.) 09:00",stops:[{key:"summer-home-start",id:null,time:"09:00",name:"Nina 住家",address:"新北市板橋區長江路一段七號",home:true,duration:0,approvers:["nina"]},{key:"summer-ice",id:"ice-land",time:"10:00",duration:120,approvers:["nina","kiki"]},{key:"summer-ikea",id:"ikea-xinzhuang",time:"12:10",duration:90,approvers:["kiki"]},{key:"summer-home-end",id:null,time:"14:35",name:"Nina 住家",address:"新北市板橋區長江路一段七號",home:true,duration:0,approvers:["nina"]}]},
  {id:"demo-birthday",name:"琪琪慶生計畫討論",date:"2025/09/13 (Sun.) 14:00",stops:[{key:"birthday-home-start",id:null,time:"14:00",name:"Nina 住家",address:"新北市板橋區長江路一段七號",home:true,duration:0,approvers:["nina"]},{key:"birthday-moca",id:"moca",time:"15:00",duration:90,approvers:["nina","kiki"]},{key:"birthday-bremen",id:"bremen",time:"16:40",duration:90,approvers:["kiki"]}]}
];
function futureTripRow(plan){const many=plan.id==="demo-summer";return `<button class="trip-row" data-open-future-plan="${plan.id}"><span class="trip-info"><b>${plan.name}</b><time>${plan.date}</time></span><span class="trip-team">${many?`<i>+2</i>`:""}<img src="${many?"assets/figma/collaborator-avatar.png":"assets/figma/trip-avatar-4.png"}" alt="" /><img src="assets/figma/profile-avatar.png" alt="" /></span>${icon("chevronRight",{className:"trip-chevron"})}</button>`;}
function subpageHeader(title){return `<header class="subpage-nav"><button class="detail-icon" data-action="menu-back" aria-label="返回">${icon("back")}</button><h1>${title}</h1></header>`}
function collectionCard(p){return `<article class="collection-card" data-place="${p.id}"><img class="collection-card__photo" src="${p.image}" alt="${p.name}" /><span class="collection-card__shade"><h3>${p.name}</h3></span><button class="collection-favorite" data-remove-favorite="${p.id}" aria-label="取消收藏 ${p.name}">${heartIcon(true,true)}</button></article>`;}
function removeFavoriteDialog(){return `<div class="remove-layer" data-action="close-remove"><section class="remove-dialog" role="dialog" aria-modal="true" aria-labelledby="remove-title" data-remove-dialog><header><h2 id="remove-title">是否移除收藏？</h2></header><footer><button data-action="close-remove">關閉</button><button class="danger-button" data-action="confirm-remove">移除收藏</button></footer></section></div>`;}
function menuPageScreen(){
  const page=state.menuPage;
  let content="";
  if(page==="favorites") { const saved=places.filter(p=>state.favorites.includes(p.id)); content=saved.length?`<div class="collection-grid">${saved.map(collectionCard).join("")}</div>`:`<p class="detail-empty">收藏庫目前是空的。</p>`; }
  if(page==="trips") {const plans=[...state.savedPlans,...demoFuturePlans];content=`<div class="trip-list">${plans.map(futureTripRow).join("")}</div>`;}
  if(page==="notifications") {const notices=[["琪琪在 夏天吹冷氣 行程新增了「自己做烘焙聚樂部」。","2025/06/26"],["您的交通工具習慣變更已完成。","2025/05/30"],["感謝您對 ROAMEE 長期的支持，本次我們更新了一些功能，希望讓您的體驗更好，讓我們幫您把握每次出遊的衝動！","2025/05/30"],["很高興遇見您。從今天起，ROAMEE 會陪您一起走走看看。","2025/04/08"]];content=`<div class="notice-list">${notices.map(([message,date])=>`<article><p>${message}</p><time>${date}</time></article>`).join("")}</div>`;}
  if(page==="profile") content=`<div class="profile-content"><div class="profile-avatar"><img src="assets/figma/profile-avatar.png" alt="個人頭像" /><button aria-label="變更照片">${icon("changePhoto")}</button></div><div class="profile-form"><label><span class="input-title"><span>您的名稱 <i>*</i></span></span><input data-profile-name value="${escapeAttribute(state.profile.name)}" placeholder="請輸入您的名稱" autocomplete="name" /></label><label><span class="input-title"><span>登入帳號</span></span><input class="is-disabled" value="nina930521@gmail.com" disabled /></label><div class="profile-password-field"><span class="input-title"><span>密碼</span><button type="button" data-action="change-password">變更密碼</button></span><span class="password-input is-disabled"><input data-password-field="profile" type="${state.passwordVisible.profile?"text":"password"}" value="12341234" disabled /><button type="button" data-password-toggle="profile" aria-label="${state.passwordVisible.profile?"隱藏密碼":"顯示密碼"}">${visibilityIcon(state.passwordVisible.profile)}</button></span></div><label class="address-field"><span class="input-title"><span>您的住址</span></span><input data-profile-address value="${escapeAttribute(state.profile.address)}" placeholder="請輸入您的住址" autocomplete="street-address" /><small>您的住址將用於一日規劃時，為您預先帶入起點與終點，以利系統幫您規劃交通時間。若您未提供住址資訊，行程安排將以第一個景點為起點。</small></label></div></div>`;
  if(page==="password") content=`<div class="password-form">${[["old","輸入舊密碼"],["new","輸入新密碼"],["confirm","再次輸入新密碼"]].map(([id,label])=>`<label><span class="input-title"><span>${label} <i>*</i></span></span><span class="password-input"><input data-password-field="${id}" type="${state.passwordVisible[id]?"text":"password"}" placeholder="請輸入密碼" /><button type="button" data-password-toggle="${id}" aria-label="${state.passwordVisible[id]?"隱藏密碼":"顯示密碼"}">${visibilityIcon(state.passwordVisible[id])}</button></span></label>`).join("")}</div><div class="password-footer"><button class="primary-btn">儲存</button></div>`;
  if(page==="settings") {const isDark=document.documentElement.dataset.theme==="dark";content=`<div class="settings-content">${[["通知","若關閉則所有通知將無法接收。","notifications",state.settings.notifications],["開啟GPS定位","可自動偵測您的位置，提供更加的推薦內容。","location",state.settings.location],["深色版","","dark",isDark]].map(([a,b,k,on])=>`<div class="setting-row"><span><b>${a}</b>${b?`<small>${b}</small>`:""}</span><button class="switch ${on?"is-on":""}" data-setting="${k}" role="switch" aria-checked="${on}" aria-label="切換${a}"><i></i></button></div>`).join("")}<section class="transport-setting"><div><h2>交通方式</h2><p>請選擇您常用的交通方式，以便自動安排個別地點的交通。</p></div><div class="transport-grid">${["走路","汽車","公車","捷運","機車","單車","火車","高鐵"].map(x=>`<button class="transport ${state.transports.includes(x)?"is-selected":""}" data-transport="${x}">${x}</button>`).join("")}</div></section></div><div class="settings-footer"><button class="primary-btn" data-action="save-settings">儲存</button></div>`;}
  if(page==="help") { const qs=["我無法使用探索周遭功能","如何使用現在去哪？","如何建立一日行程？","如何邀請朋友共同編輯？","如何修改交通方式？","如何聯絡 ROAMEE？"]; const answers=["您需要先開啟定位，才能使用此功能。","選擇左側主題，即可查看符合當下需求的景點。","前往一日規劃並依照畫面指示選擇景點。","建立行程後即可邀請朋友加入共同編輯。","請前往設定，在交通方式中選擇常用項目。","請由選單進入聯絡我們，透過信箱與我們聯繫。"]; content=`<div class="faq-list">${qs.map((q,i)=>`<button class="faq-row ${state.openFaq===i?"is-open":""}" data-faq="${i}"><span class="faq-chevron" aria-hidden="true">${state.openFaq===i?icon("faqDown",{className:"faq-chevron__down"}):`${icon("faqRightFill",{className:"faq-chevron__right-fill"})}${icon("faqRightStroke",{className:"faq-chevron__right-stroke"})}`}</span><span class="faq-content"><span class="faq-line"><span class="faq-tag-wrap"><i class="faq-mark">Q</i></span><b>${q}</b></span>${state.openFaq===i?`<span class="faq-line faq-answer"><span class="faq-tag-wrap"><i>A</i></span><small>${answers[i]}</small></span>`:""}</span></button>`).join("")}</div>`; }
  if(page==="privacy") content=`<article class="article-copy"><p>ROAMEE 是一款協助您記錄靈感、探索路線與與朋友共同規劃旅程的應用程式。為了提供您更個人化、順暢的體驗，我們會根據您提供的資訊進行適當使用，但我們也非常重視您的隱私與資料安全。</p><p>請放心，我們不會隨意蒐集、販售或濫用您的個人資訊。</p><h2>我們會收集哪些資訊？</h2><p>為了讓 ROAMEE 正常運作、推薦合適的地點與幫助您完成行程規劃，我們可能會收集以下資訊：</p><ul><li>基本資料：如暱稱、電子信箱（若您註冊帳號時填寫）</li><li>使用紀錄：如您點擊的景點、建立的行程、收藏偏好</li><li>裝置資訊：如您使用的手機系統版本、螢幕大小（用來改善使用體驗）</li><li>位置資訊（選擇性）：如果您開啟定位，我們會用它來提供附近推薦，但不會在背景持續追蹤您的位置</li></ul><h2>我們怎麼保護您的資訊？</h2><ul><li>所有資料皆透過加密傳輸與儲存</li><li>您的私人行程與設定不會公開，除非您選擇與朋友共編</li><li>我們不會將您的資料提供給第三方做廣告行銷用途</li></ul><h2>您可以選擇什麼？</h2><ul><li>不提供位置資訊仍可使用大多數功能</li><li>可隨時刪除您的行程或帳號資料</li><li>若您使用好友共編，我們僅分享行程內容，不會交換帳號個資</li></ul><h2>聯絡我們</h2><p>若您對於隱私政策有任何疑問，歡迎您透過留言或信箱<a href="mailto:dana97095@gmail.com">聯絡我們</a>，我們會盡快回覆您。</p><p>謝謝你信任 ROAMEE，讓我們能陪你一起踏上每一次隨性的出走。</p></article>`;
  if(page==="contact") content=`<div class="contact-content"><div class="contact-copy"><p>有時靈感來得突然，出遊的衝動值得被好好接住！</p><p>ROAMEE 想成為你旅途上的夥伴，陪你從一個靈感出發，找到剛剛好的目的地。</p><p><strong>掌握出遊衝動，尋找無盡靈感！</strong></p><p>不論是回饋建議、合作想法，或只是想和我們說聲嗨，我們都很樂意收到你的來信：</p></div><p>設計團隊：曾柏瑄、林于庭</p><a class="email-link" href="mailto:dana97095@gmail.com"><span>${icon("mail")}</span><u>dana97095@gmail.com</u></a></div>`;
  return `<section class="subpage-screen">${subpageHeader(page==="password"?"個人資料":menuTitles[page])}<main class="subpage-content">${content}</main>${state.pendingFavorite?removeFavoriteDialog():""}</section>`;
}

function render({ welcome=false, sheet=false }={}) {
  app.innerHTML = state.detail ? detailScreen() : state.menuPage ? menuPageScreen() : state.screen==="now" ? nowScreen() : state.screen==="nearby" ? nearbyScreen() : planScreen();
  if(sheet) app.insertAdjacentHTML("beforeend",surpriseSheet());
  if(welcome) app.insertAdjacentHTML("beforeend",`<section class="welcome"><div class="welcome__copy"><p>Welcome back</p><h1>ROAMEE</h1><small>點一下，看看現在能去哪裡</small></div></section>`);
}

let planToastTimer=null;
function showPlanCopyToast(){
  document.querySelector(".plan-toast-layer")?.remove();
  app.insertAdjacentHTML("beforeend",`<div class="plan-toast-layer" role="status" aria-live="polite"><div class="plan-toast">${toastCheckIcon()}<span>已複製連結至剪貼簿</span></div></div>`);
  clearTimeout(planToastTimer);
  planToastTimer=setTimeout(()=>{const layer=document.querySelector(".plan-toast-layer");layer?.classList.add("is-leaving");setTimeout(()=>layer?.remove(),300);},2000);
}
function savePlanAndShowToast(){
  const date=`2026/08/22 (Sat.) ${String(state.planHour).padStart(2,"0")}:${String(state.planMinute).padStart(2,"0")}`;
  const saved={id:`plan-${Date.now()}`,name:state.planName.trim()||"未命名行程",date,stops:ensurePlanStops().map(stop=>({...stop,approvers:[...(stop.approvers??[])]}))};
  state.savedPlans=[saved,...state.savedPlans.filter(plan=>plan.name!==saved.name)];saveSavedPlans();
  document.querySelector(".plan-toast-layer")?.remove();
  app.insertAdjacentHTML("beforeend",`<div class="plan-toast-layer" role="status" aria-live="polite"><div class="plan-toast">${toastCheckIcon()}<span>已儲存至未來行程</span></div></div>`);
  clearTimeout(planToastTimer);
  planToastTimer=setTimeout(()=>{const layer=document.querySelector(".plan-toast-layer");layer?.classList.add("is-leaving");setTimeout(()=>{resetPlanDraft();state.menuPage="trips";render();},300);},2000);
}
function resetPlanDraft(){
  state.planThemes=[];state.planAddedPlaces=[];state.planItineraryPlaces=[];state.planStops=null;state.planName="";state.planInviteEmail="";state.planCollaborators=[];state.planKikiIncluded=true;state.planHour=9;state.planMinute=0;state.planBudget=9999;state.planDraft=null;state.planSearchOpen=false;state.planSearchQuery="";state.planSetupOpen=false;state.planItineraryOpen=false;state.planReturnToTrips=false;state.planTeamSettingsOpen=false;state.planTeamDraft=null;state.planBudgetOnlyOpen=false;state.planPendingAddPlace=null;state.planStopOpen=null;state.planExpandedRecommendation=null;state.planRemoveCandidate=null;state.planAddSheetOpen=false;state.planAddDraft=[];
}

function runSurprise(){
  const matches=places.filter(p=>state.selectedTags.length===0||state.selectedTags.some(t=>p.tags.includes(t)));
  state.surpriseIds=[...matches].sort(()=>Math.random()-.5).slice(0,Math.min(5,matches.length)).map(p=>p.id);
  state.detail=null; render();
}

app.addEventListener("click",event=>{
  const target=event.target.closest("button,[data-action],[data-place]"); if(!target) return;
  if(target.closest(".nearby-card")&&performance.now()<suppressDiscoverClickUntil) return;
  const screen=target.dataset.screen; if(screen){state.screen=screen;state.detail=null;render();return;}
  const place=target.dataset.place; if(place){state.detail=place;state.detailTab="intro";state.detailImage=0;render();scrollTo(0,0);return;}
  const theme=target.dataset.themeName; if(theme){const railScroll=target.closest(".theme-rail")?.scrollTop??0;state.theme=theme;state.surpriseIds=null;render();const nextRail=app.querySelector(".theme-rail");if(nextRail)nextRail.scrollTop=railScroll;return;}
  const nearbyTheme=target.dataset.nearbyTheme; if(nearbyTheme){state.discoverTheme=nearbyTheme;state.discoverIndex=0;render();return;}
  const tag=target.dataset.tag; if(tag){state.selectedTags=state.selectedTags.includes(tag)?state.selectedTags.filter(t=>t!==tag):[...state.selectedTags,tag];render({sheet:true});return;}
  const detailTab=target.dataset.detailTab; if(detailTab){state.detailTab=detailTab;render();return;}
  const galleryIndex=target.dataset.galleryIndex; if(galleryIndex!==undefined){state.detailImage=Number(galleryIndex);render();return;}
  const menuPage=target.dataset.menuPage; if(menuPage){if(menuPage==="logout"){state.planSearchHistory=[...defaultPlanSearchHistory];savePlanSearchHistory();state.planSearchOpen=false;state.planSearchQuery="";state.menuPage=null;state.detail=null;render({welcome:true});setTimeout(()=>document.querySelector('.welcome')?.classList.add('is-leaving'),900);setTimeout(()=>document.querySelector('.welcome')?.remove(),1400);}else{state.menuPage=menuPage;render();}return;}
  const futurePlanId=target.dataset.openFuturePlan;if(futurePlanId){const plan=[...state.savedPlans,...demoFuturePlans].find(item=>item.id===futurePlanId);if(plan){state.screen="plan";state.planName=plan.name;state.planStops=plan.stops.map(stop=>({...stop,approvers:[...(stop.approvers??[])]}));state.planCollaborators=[];state.planKikiIncluded=true;state.planItineraryOpen=true;state.planReturnToTrips=true;state.menuPage=null;render();}return;}
  const passwordToggle=target.dataset.passwordToggle;if(passwordToggle){state.passwordVisible[passwordToggle]=!state.passwordVisible[passwordToggle];const input=document.querySelector(`[data-password-field="${passwordToggle}"]`);if(input)input.type=state.passwordVisible[passwordToggle]?"text":"password";target.innerHTML=visibilityIcon(state.passwordVisible[passwordToggle]);target.setAttribute("aria-label",state.passwordVisible[passwordToggle]?"隱藏密碼":"顯示密碼");return;}
  const faq=target.dataset.faq; if(faq!==undefined){state.openFaq=state.openFaq===Number(faq)?null:Number(faq);render();return;}
  const removeFavorite=target.dataset.removeFavorite; if(removeFavorite){state.pendingFavorite=removeFavorite;render();return;}
  const setting=target.dataset.setting; if(setting){if(setting==="dark"){const dark=document.documentElement.dataset.theme!=="dark";document.documentElement.dataset.theme=dark?"dark":"light";}else state.settings[setting]=!state.settings[setting];render();return;}
  const transport=target.dataset.transport; if(transport){state.transports=state.transports.includes(transport)?state.transports.filter(x=>x!==transport):[...state.transports,transport];render();return;}
  const planTheme=target.dataset.planTheme; if(planTheme){const scrollTop=document.querySelector(".plan-wall")?.scrollTop??0;if(state.planThemes.includes(planTheme)) state.planThemes=state.planThemes.filter(item=>item!==planTheme);else if(state.planThemes.length+state.planAddedPlaces.length<3) state.planThemes=[...state.planThemes,planTheme];else state.planLimitOpen=true;render();const wall=document.querySelector(".plan-wall");if(wall) wall.scrollTop=scrollTop;return;}
  const planAdjust=target.dataset.planAdjust; if(planAdjust){const draft=state.planDraft??={hour:state.planHour,minute:state.planMinute,budget:state.planBudget};if(planAdjust==="hour-up") draft.hour=(draft.hour+1)%24;if(planAdjust==="hour-down") draft.hour=(draft.hour+23)%24;if(planAdjust==="minute-up") draft.minute=(draft.minute+30)%60;if(planAdjust==="minute-down") draft.minute=(draft.minute+30)%60;render();return;}
  const addPlanPlace=target.dataset.addPlanPlace; if(addPlanPlace){if(state.planSearchContext==="itinerary"){state.planPendingAddPlace=addPlanPlace;render();}else{if(state.planAddedPlaces.includes(addPlanPlace)) state.planAddedPlaces=state.planAddedPlaces.filter(id=>id!==addPlanPlace);else if(state.planThemes.length+state.planAddedPlaces.length<3) state.planAddedPlaces=[...state.planAddedPlaces,addPlanPlace];else state.planLimitOpen=true;render();}return;}
  const planPlaceDetail=target.dataset.planPlaceDetail; if(planPlaceDetail){state.detail=planPlaceDetail;state.detailTab="intro";state.detailImage=0;render();scrollTo(0,0);return;}
  const planHistory=target.dataset.planHistory; if(planHistory){state.planSearchQuery=planHistory;rememberPlanSearch(planHistory);render();return;}
  const removeKind=target.dataset.planRemoveKind; if(removeKind){state.planRemoveCandidate={kind:removeKind,id:target.dataset.planRemoveId};render();return;}
  const draftRemoveKind=target.dataset.planDraftRemoveKind;if(draftRemoveKind&&state.planTeamDraft){const id=target.dataset.planDraftRemoveId;if(draftRemoveKind==="theme")state.planTeamDraft.themes=state.planTeamDraft.themes.filter(x=>x!==id);else state.planTeamDraft.places=state.planTeamDraft.places.filter(x=>x!==id);target.remove();return;}
  const protectedMember=target.dataset.protectedMember;if(protectedMember){state.planBlockedRemoval=protectedMember;if(!document.querySelector(".plan-protected-layer"))app.insertAdjacentHTML("beforeend",protectedMemberDialog(protectedMember));return;}
  const removeDraftCollaborator=target.dataset.removeTeamDraftCollaborator;if(removeDraftCollaborator&&state.planTeamDraft){state.planTeamDraft.collaborators=state.planTeamDraft.collaborators.filter(x=>x!==removeDraftCollaborator);target.closest(".plan-collaborator")?.remove();return;}
  const removeCollaborator=target.dataset.removePlanCollaborator; if(removeCollaborator){state.planCollaborators=state.planCollaborators.filter(email=>email!==removeCollaborator);target.closest(".plan-collaborator")?.remove();return;}
  const addTheme=target.dataset.planAddTheme; if(addTheme){
    const baseThemes=state.planTeamDraft?.themes??state.planThemes;
    const basePlaces=state.planTeamDraft?.places??state.planAddedPlaces;
    if(state.planAddDraft.includes(addTheme)) state.planAddDraft=state.planAddDraft.filter(item=>item!==addTheme);
    else if(baseThemes.length+basePlaces.length+state.planAddDraft.length<3) state.planAddDraft=[...state.planAddDraft,addTheme];
    else {state.planLimitOpen=true;if(!document.querySelector(".plan-limit-layer"))app.insertAdjacentHTML("beforeend",planLimitDialog());return;}
    const selected=state.planAddDraft.includes(addTheme);target.classList.toggle("is-selected",selected);target.setAttribute("aria-pressed",String(selected));return;
  }
  const openStop=target.dataset.openPlanStop;if(openStop){if(performance.now()<suppressPlanStopClickUntil)return;const stop=ensurePlanStops().find(item=>item.key===openStop);if(stop?.id){state.planStopOpen=openStop;render();}return;}
  const stopDetail=target.dataset.planStopDetail;if(stopDetail){state.planStopOpen=null;state.detail=stopDetail;state.detailTab="intro";state.detailImage=0;render();scrollTo(0,0);return;}
  const toggleRecommendation=target.dataset.toggleItineraryRecommendation;if(toggleRecommendation){const scrollTop=document.querySelector(".plan-itinerary-body")?.scrollTop??0;state.planExpandedRecommendation=state.planExpandedRecommendation===toggleRecommendation?null:toggleRecommendation;render();const body=document.querySelector(".plan-itinerary-body");if(body)body.scrollTop=scrollTop;return;}
  const addRecommendation=target.dataset.addItineraryRecommendation;if(addRecommendation){const place=places.find(item=>item.id===addRecommendation);const stops=ensurePlanStops();if(place&&!stops.some(item=>item.id===place.id)){stops.push({key:`stop-${Date.now()}-${place.id}`,id:place.id,time:"00:00",duration:place.duration??90,approvers:place.id==="ice-land"?["nina","kiki"]:["nina"]});recalculatePlanStopTimes(stops);state.planExpandedRecommendation=null;render();}return;}
  const stopAdjust=target.dataset.stopAdjust;if(stopAdjust&&state.planStopOpen){const stop=ensurePlanStops().find(item=>item.key===state.planStopOpen);if(stop){let hour=Math.min(12,Math.floor(stop.duration/60));let minute=[0,15,30,45].reduce((best,value)=>Math.abs(value-stop.duration%60)<Math.abs(best-stop.duration%60)?value:best,0);if(stopAdjust==="hour-up")hour=(hour+1)%13;if(stopAdjust==="hour-down")hour=(hour+12)%13;if(stopAdjust==="minute-up")minute=(minute+15)%60;if(stopAdjust==="minute-down")minute=(minute+45)%60;stop.duration=hour*60+minute;const strong=target.closest(".plan-number")?.querySelector("strong");if(strong)strong.textContent=String(stopAdjust.startsWith("hour")?hour:minute).padStart(2,"0");}return;}
  switch(target.dataset.action){
    case "theme": document.documentElement.dataset.theme=document.documentElement.dataset.theme==="dark"?"light":"dark"; render(); break;
    case "menu": app.insertAdjacentHTML("beforeend",menuSheet()); break;
    case "surprise": render({sheet:true}); break;
    case "close-sheet": if(event.target.closest("[data-sheet]")&&!target.matches("[data-action='close-sheet']")) return; render(); break;
    case "close-menu": if(event.target.closest("[data-menu-drawer]")) return; render(); break;
    case "clear-tags": state.selectedTags=[];render({sheet:true});break;
    case "run-surprise": runSurprise(); break;
    case "clear-surprise": state.surpriseIds=null;render();break;
    case "next": state.discoverIndex++;render();break;
    case "back": state.detail=null;state.reviewOpen=false;render();break;
    case "menu-back": if(state.menuPage==="password") state.menuPage="profile";else if(state.menuPage==="trips"){resetPlanDraft();state.menuPage=null;}else state.menuPage=null;render();break;
    case "next-detail-image": state.detailImage++;render();break;
    case "favorite": state.favorites=state.favorites.includes(state.detail)?state.favorites.filter(id=>id!==state.detail):[...state.favorites,state.detail];render();break;
    case "open-review": state.reviewOpen=true;render();break;
    case "close-review": if(event.target.closest('[data-review-dialog]')&&!target.matches("[data-action='close-review']")) return; state.reviewOpen=false;render();break;
    case "submit-review": state.reviewOpen=false;render();break;
    case "change-password": state.menuPage="password";render();break;
    case "close-remove": if(event.target.closest('[data-remove-dialog]')&&!target.matches("[data-action='close-remove']")) return; state.pendingFavorite=null;render();break;
    case "confirm-remove": state.favorites=state.favorites.filter(id=>id!==state.pendingFavorite);state.pendingFavorite=null;render();break;
    case "save-settings": target.textContent="✓ 已儲存";break;
    case "save-plan": if(!document.querySelector(".plan-toast-layer"))savePlanAndShowToast();break;
    case "open-plan-settings": state.planDraft={hour:state.planHour,minute:state.planMinute,budget:state.planBudget};state.planSettingsOpen=true;render();break;
    case "close-plan-settings": if(target.matches(".plan-modal-layer")&&event.target.closest("[data-plan-settings]")) return;state.planDraft=null;state.planSettingsOpen=false;render();break;
    case "close-plan-limit": if(event.target.closest("[data-plan-limit-dialog]")&&!target.matches("[data-action='close-plan-limit']")) return;state.planLimitOpen=false;document.querySelector(".plan-limit-layer")?.remove();break;
    case "confirm-plan-settings": if(state.planDraft){state.planHour=state.planDraft.hour;state.planMinute=state.planDraft.minute;state.planBudget=state.planDraft.budget;}state.planDraft=null;state.planSettingsOpen=false;render();break;
    case "open-plan-search": state.planSearchContext="setup";state.planSearchOpen=true;state.planSearchQuery="";render();break;
    case "open-itinerary-search": state.planSearchContext="itinerary";state.planSearchOpen=true;state.planSearchQuery="";render();break;
    case "close-plan-search": state.planSearchOpen=false;state.planSearchQuery="";render();break;
    case "clear-plan-query": state.planSearchQuery="";render();break;
    case "clear-plan-history": state.planSearchHistory=[];savePlanSearchHistory();render();break;
    case "open-search-favorites": state.menuPage="favorites";render();break;
    case "start-plan": if(state.planThemes.length+state.planAddedPlaces.length){state.planSetupOpen=true;state.planSearchOpen=false;render();}break;
    case "close-plan-setup": state.planSetupOpen=false;state.planRemoveCandidate=null;state.planAddSheetOpen=false;render();break;
    case "copy-plan-link": navigator.clipboard?.writeText("https://roamee.app/plan/invite-demo").catch(()=>{});showPlanCopyToast();break;
    case "add-plan-collaborator": {const email=state.planInviteEmail.trim();if(email&&email!=="nina930521@gmail.com"&&!state.planCollaborators.includes(email))state.planCollaborators=[...state.planCollaborators,email];state.planInviteEmail="";render();break;}
    case "close-plan-remove": if(target.matches(".plan-remove-layer")&&event.target.closest("[data-plan-remove-dialog]"))return;state.planRemoveCandidate=null;render();break;
    case "confirm-plan-remove": if(state.planRemoveCandidate?.kind==="theme")state.planThemes=state.planThemes.filter(item=>item!==state.planRemoveCandidate.id);else if(state.planRemoveCandidate?.kind==="place")state.planAddedPlaces=state.planAddedPlaces.filter(item=>item!==state.planRemoveCandidate.id);state.planRemoveCandidate=null;render();break;
    case "open-plan-add-sheet": state.planAddDraft=[];state.planAddSheetOpen=true;if(!document.querySelector(".plan-add-layer"))app.insertAdjacentHTML("beforeend",planAddSheet());break;
    case "close-plan-add-sheet": if(target.matches(".plan-add-layer")&&event.target.closest("[data-plan-add-sheet]"))return;state.planAddDraft=[];state.planAddSheetOpen=false;document.querySelector(".plan-add-layer")?.remove();break;
    case "confirm-plan-add-sheet": {const baseThemes=state.planTeamDraft?.themes??state.planThemes;const basePlaces=state.planTeamDraft?.places??state.planAddedPlaces;const next=[...baseThemes,...state.planAddDraft.filter(item=>!baseThemes.includes(item))].slice(0,Math.max(0,3-basePlaces.length));if(state.planTeamDraft){state.planTeamDraft.themes=next;const chips=document.querySelector(".plan-team-sheet .plan-selected-chips");if(chips)chips.innerHTML=teamDraftChipsMarkup();}else{state.planThemes=next;const chips=document.querySelector(".plan-setup-screen .plan-selected-chips");if(chips)chips.innerHTML=setupChipsMarkup();}state.planAddDraft=[];state.planAddSheetOpen=false;document.querySelector(".plan-add-layer")?.remove();break;}
    case "plan-setup-next": if(!state.planName.trim())return;state.planSetupOpen=false;state.planItineraryOpen=true;scrollTo(0,0);render();break;
    case "close-plan-itinerary": if(state.planReturnToTrips){state.planItineraryOpen=false;state.planReturnToTrips=false;state.menuPage="trips";}else{state.planItineraryOpen=false;state.planSetupOpen=true;}render();break;
    case "add-home-stop": {const stops=ensurePlanStops();if(!(stops.length>1&&stops.at(-1)?.home)){stops.push({key:`home-end-${Date.now()}`,id:null,time:"00:00",name:"Nina 住家",address:"新北市板橋區長江路一段七號",home:true,duration:0,approvers:["nina"]});recalculatePlanStopTimes(stops);state.planExpandedRecommendation=null;}render();break;}
    case "open-plan-team-settings": state.planTeamDraft={name:state.planName,themes:[...state.planThemes],places:[...state.planAddedPlaces],collaborators:[...state.planCollaborators],kikiIncluded:state.planKikiIncluded};state.planTeamSettingsOpen=true;render();break;
    case "close-plan-team-settings": if(target.matches(".plan-team-layer")&&event.target.closest("[data-plan-team-sheet]"))return;state.planTeamDraft=null;state.planTeamSettingsOpen=false;document.querySelector(".plan-team-layer")?.remove();break;
    case "confirm-plan-team-settings": if(state.planTeamDraft){state.planName=state.planTeamDraft.name.trim()||state.planName;state.planThemes=[...state.planTeamDraft.themes];state.planAddedPlaces=[...state.planTeamDraft.places];state.planCollaborators=[...state.planTeamDraft.collaborators];state.planKikiIncluded=state.planTeamDraft.kikiIncluded;}state.planTeamDraft=null;state.planTeamSettingsOpen=false;render();break;
    case "add-team-draft-collaborator": {const input=document.querySelector("[data-plan-team-invite]");const email=input?.value.trim();if(email&&state.planTeamDraft&&!state.planTeamDraft.collaborators.includes(email)){state.planTeamDraft.collaborators.push(email);document.querySelector(".plan-team-sheet .plan-collaborators")?.insertAdjacentHTML("beforeend",`<div class="plan-collaborator is-pending"><img src="assets/figma/invite-avatar.png" alt="" /><span><b>邀請中</b><small>${email}</small></span><button class="plan-kick-person" data-remove-team-draft-collaborator="${email}" aria-label="移除 ${email}">${kickPersonIcon()}</button></div>`);}if(input)input.value="";break;}
    case "close-protected-member": state.planBlockedRemoval=null;document.querySelector(".plan-protected-layer")?.remove();break;
    case "open-plan-budget-only": state.planDraft={budget:state.planBudget};state.planBudgetOnlyOpen=true;render();break;
    case "close-plan-budget-only": if(target.matches(".plan-modal-layer")&&event.target.closest("[data-plan-budget-only]"))return;state.planDraft=null;state.planBudgetOnlyOpen=false;render();break;
    case "confirm-plan-budget-only": if(state.planDraft)state.planBudget=state.planDraft.budget;state.planDraft=null;state.planBudgetOnlyOpen=false;render();break;
    case "close-plan-add-place": if(target.matches(".plan-add-place-layer")&&event.target.closest("[data-plan-add-place-dialog]"))return;state.planPendingAddPlace=null;render();break;
    case "confirm-plan-add-place": if(state.planPendingAddPlace){state.planItineraryPlaces=[...state.planItineraryPlaces,state.planPendingAddPlace];const place=places.find(item=>item.id===state.planPendingAddPlace);const stops=ensurePlanStops();if(place&&!stops.some(item=>item.id===place.id)){stops.push({key:`search-${Date.now()}-${place.id}`,id:place.id,time:"00:00",duration:place.duration??90,approvers:["nina"]});recalculatePlanStopTimes(stops);}}state.planPendingAddPlace=null;state.planSearchOpen=false;state.planSearchQuery="";render();break;
    case "close-plan-stop": if(target.matches(".plan-stop-layer")&&event.target.closest("[data-plan-stop-sheet]"))return;state.planStopOpen=null;document.querySelector(".plan-stop-layer")?.remove();break;
    case "agree-plan-stop": {const stop=ensurePlanStops().find(item=>item.key===state.planStopOpen);if(stop&&!stop.approvers.includes("nina"))stop.approvers.push("nina");render();break;}
    case "save-plan-stop": recalculatePlanStopTimes();state.planStopOpen=null;render();break;
    case "remove-plan-stop": {const stops=ensurePlanStops();const stop=stops.find(item=>item.key===state.planStopOpen);if(stop)state.planStops=stops.filter(item=>item.key!==stop.key);recalculatePlanStopTimes(state.planStops);state.planStopOpen=null;render();break;}
  }
});

function paintPlanBudget(value,{preserveInput=false}={}){
  const budget=Math.max(0,Math.min(9999,Number(value)||0));
  if(state.planDraft) state.planDraft.budget=budget;
  const slider=document.querySelector(".plan-budget-slider");
  const range=slider?.querySelector("[data-plan-budget]");
  const input=document.querySelector("[data-plan-budget-input]");
  slider?.style.setProperty("--budget-progress",`${budget/9999*100}%`);
  if(range) range.value=budget;
  if(input&&!preserveInput) input.value=budget>=9999?"9999+":budget.toLocaleString("en-US");
}
app.addEventListener("input",event=>{
  if(event.target.matches("[data-profile-name]")) state.profile.name=event.target.value;
  if(event.target.matches("[data-profile-address]")) state.profile.address=event.target.value;
  if(event.target.matches("[data-plan-budget]")) paintPlanBudget(event.target.value);
  if(event.target.matches("[data-plan-budget-input]")){
    const digits=event.target.value.replace(/\D/g,"");
    const value=Math.min(9999,Number(digits)||0);
    paintPlanBudget(value,{preserveInput:true});
    event.target.value=digits===""?"":value>=9999?"9999+":value.toLocaleString("en-US");
  }
  if(event.target.matches("[data-plan-search-input]")){
    state.planSearchQuery=event.target.value;
    event.target.closest(".plan-search-input")?.querySelector(".plan-search-clear")?.classList.toggle("is-hidden",!event.target.value);
  }
  if(event.target.matches("[data-plan-name]")){
    state.planName=event.target.value;
    const next=document.querySelector("[data-action='plan-setup-next']");
    if(next) next.disabled=!state.planName.trim();
  }
  if(event.target.matches("[data-plan-team-name]")&&state.planTeamDraft) state.planTeamDraft.name=event.target.value;
  if(event.target.matches("[data-plan-invite]")) state.planInviteEmail=event.target.value;
});
app.addEventListener("blur",event=>{if(event.target.matches("[data-plan-budget-input]")) paintPlanBudget(state.planDraft?.budget??0);},true);
app.addEventListener("keydown",event=>{if(event.target.matches("[data-plan-search-input]")&&event.key==="Enter"){event.preventDefault();state.planSearchQuery=event.target.value.trim();rememberPlanSearch(state.planSearchQuery);render();}});

let planStopDrag=null;
let suppressPlanStopClickUntil=0;
function clearPlanStopDragVisuals(){document.querySelectorAll(".itinerary-stop").forEach(item=>{item.classList.remove("is-dragging","is-drop-target");item.querySelector(".itinerary-stop-card")?.style.removeProperty("translate");});}
app.addEventListener("pointerdown",event=>{
  const item=event.target.closest(".itinerary-stop.is-draggable");if(!item||state.planStopOpen)return;
  const drag={pointerId:event.pointerId,key:item.dataset.routeStop,item,startY:event.clientY,moved:false,active:false,targetKey:null,timer:null};
  drag.timer=setTimeout(()=>{if(planStopDrag!==drag)return;drag.active=true;drag.item.classList.add("is-dragging");drag.item.setPointerCapture?.(drag.pointerId);suppressPlanStopClickUntil=performance.now()+600;},360);
  planStopDrag=drag;
});
app.addEventListener("pointermove",event=>{
  if(!planStopDrag||event.pointerId!==planStopDrag.pointerId)return;
  const delta=event.clientY-planStopDrag.startY;
  if(!planStopDrag.active){if(Math.abs(delta)>8){clearTimeout(planStopDrag.timer);suppressPlanStopClickUntil=performance.now()+250;planStopDrag=null;}return;}
  event.preventDefault();if(Math.abs(delta)>5)planStopDrag.moved=true;
  const card=planStopDrag.item.querySelector(".itinerary-stop-card");if(card)card.style.translate=`0 ${delta}px`;
  const candidates=[...document.querySelectorAll(".itinerary-stop.is-draggable")].filter(item=>item!==planStopDrag.item);
  const target=candidates.reduce((closest,item)=>{const distance=Math.abs(event.clientY-(item.getBoundingClientRect().top+item.getBoundingClientRect().height/2));return !closest||distance<closest.distance?{item,distance}:closest;},null)?.item??null;
  document.querySelectorAll(".itinerary-stop.is-drop-target").forEach(item=>item.classList.remove("is-drop-target"));target?.classList.add("is-drop-target");planStopDrag.targetKey=target?.dataset.routeStop??null;
});
function endPlanStopDrag(event,cancelled=false){
  if(!planStopDrag||event.pointerId!==planStopDrag.pointerId)return;
  const {key,targetKey,moved,active,timer}=planStopDrag;clearTimeout(timer);clearPlanStopDragVisuals();planStopDrag=null;
  if(!active)return;
  suppressPlanStopClickUntil=performance.now()+450;
  if(cancelled||!moved||!targetKey||key===targetKey)return;
  const stops=ensurePlanStops();const from=stops.findIndex(stop=>stop.key===key);const to=stops.findIndex(stop=>stop.key===targetKey);if(from<0||to<0||stops[from].home||stops[to].home)return;
  [stops[from],stops[to]]=[stops[to],stops[from]];recalculatePlanStopTimes(stops);render();
}
app.addEventListener("pointerup",event=>endPlanStopDrag(event));
app.addEventListener("pointercancel",event=>{if(planStopDrag)clearTimeout(planStopDrag.timer);endPlanStopDrag(event,true);});

let planWheelDrag=null;
const wrap=(value,size)=>(value%size+size)%size;
function planWheelValue(type,start,steps){return type==="hour"?wrap(start-steps,24):wrap(start/30-steps,2)*30;}
app.addEventListener("pointerdown",event=>{
  const wheel=event.target.closest("[data-plan-wheel],[data-stop-wheel]");
  if(!wheel||event.target.closest("button")) return;
  const stopMode=wheel.hasAttribute("data-stop-wheel");
  const type=wheel.dataset.stopWheel??wheel.dataset.planWheel;
  const stop=stopMode?ensurePlanStops().find(item=>item.key===state.planStopOpen):null;
  const start=stopMode?(type==="hour"?Math.min(12,Math.floor((stop?.duration??0)/60)):(stop?.duration??0)%60):(type==="hour"?(state.planDraft?.hour??state.planHour):(state.planDraft?.minute??state.planMinute));
  planWheelDrag={pointerId:event.pointerId,wheel,type,start,startY:event.clientY,steps:0,stopMode,stop};
  wheel.classList.add("is-dragging");
  wheel.setPointerCapture(event.pointerId);
  event.preventDefault();
});
app.addEventListener("pointermove",event=>{
  if(!planWheelDrag||event.pointerId!==planWheelDrag.pointerId) return;
  const delta=event.clientY-planWheelDrag.startY;
  const steps=Math.round(delta/28);
  planWheelDrag.steps=steps;
  const remainder=Math.max(-14,Math.min(14,delta-steps*28));
  const value=planWheelDrag.stopMode?(planWheelDrag.type==="hour"?wrap(planWheelDrag.start-steps,13):wrap(planWheelDrag.start/15-steps,4)*15):planWheelValue(planWheelDrag.type,planWheelDrag.start,steps);
  const strong=planWheelDrag.wheel.querySelector("strong");
  if(strong){strong.textContent=String(value).padStart(2,"0");strong.style.translate=`0 ${remainder}px`;}
});
app.addEventListener("pointerup",event=>{
  if(!planWheelDrag||event.pointerId!==planWheelDrag.pointerId) return;
  const {type,start,steps,wheel,stopMode,stop}=planWheelDrag;
  const value=stopMode?(type==="hour"?wrap(start-steps,13):wrap(start/15-steps,4)*15):planWheelValue(type,start,steps);
  if(stopMode&&stop){const hour=type==="hour"?value:Math.min(12,Math.floor(stop.duration/60));const minute=type==="minute"?value:stop.duration%60;stop.duration=hour*60+minute;}else if(state.planDraft){if(type==="hour") state.planDraft.hour=value;else state.planDraft.minute=value;}
  const strong=wheel.querySelector("strong");if(strong){strong.textContent=String(value).padStart(2,"0");strong.style.translate="";}
  wheel.classList.remove("is-dragging");
  planWheelDrag=null;
});
app.addEventListener("pointercancel",event=>{if(planWheelDrag&&event.pointerId===planWheelDrag.pointerId){const strong=planWheelDrag.wheel.querySelector("strong");if(strong){strong.textContent=String(planWheelDrag.start).padStart(2,"0");strong.style.translate="";}planWheelDrag.wheel.classList.remove("is-dragging");planWheelDrag=null;}});

let galleryStartX=null;
app.addEventListener("pointerdown",event=>{if(event.target.closest("[data-gallery]")) galleryStartX=event.clientX;});
app.addEventListener("pointerup",event=>{if(galleryStartX===null||!state.detail) return; const delta=event.clientX-galleryStartX; galleryStartX=null; if(Math.abs(delta)<36) return; const p=places.find(x=>x.id===state.detail); const total=(p.images?.length||1); state.detailImage=Math.max(0,Math.min(total-1,state.detailImage+(delta<0?1:-1))); render();});

let discoverDrag=null;
let suppressDiscoverClickUntil=0;
function paintDiscoverDrag(delta){
  const stage=document.querySelector("[data-nearby-stage]");
  const current=stage?.querySelector(".nearby-card.is-current");
  if(!stage||!current) return;
  const step=current.getBoundingClientRect().width+8;
  const progress=Math.min(1,Math.abs(delta)/step);
  const targetOffset=delta<0?1:-1;
  stage.classList.toggle("is-dragging",Math.abs(delta)>0);
  stage.querySelectorAll(".nearby-card").forEach(card=>{
    const offset=Number(card.dataset.nearbyOffset);
    const scale=offset===0 ? 1-.077*progress : (offset===targetOffset ? .923+.077*progress : .923);
    const rotation=offset===0?Math.max(-9,Math.min(9,delta/18)):0;
    card.style.transform=`translateX(calc(-50% + ${offset*step+delta}px)) scale(${scale}) rotate(${rotation}deg)`;
    card.style.opacity=offset===0?String(1-.1*progress):String(1-.3*progress);
  });
}
function endDiscoverDrag(event,cancelled=false){
  if(!discoverDrag||event.pointerId!==discoverDrag.pointerId) return;
  const delta=event.clientX-discoverDrag.startX;
  const stage=document.querySelector("[data-nearby-stage]");
  const move=!cancelled&&Math.abs(delta)>60;
  suppressDiscoverClickUntil=performance.now()+(Math.abs(delta)>5?400:0);
  stage?.classList.add("is-settling");
  if(move){
    const current=stage?.querySelector(".nearby-card.is-current");
    const step=(current?.getBoundingClientRect().width||255)+8;
    paintDiscoverDrag(delta<0?-step:step);
    setTimeout(()=>{state.discoverIndex+=delta<0?1:-1;render();},220);
  }else{
    paintDiscoverDrag(0);
    setTimeout(()=>{stage?.classList.remove("is-dragging","is-settling");stage?.querySelectorAll(".nearby-card").forEach(card=>{card.style.transform="";card.style.opacity="";});},220);
  }
  discoverDrag=null;
}
app.addEventListener("pointerdown",event=>{const card=event.target.closest(".nearby-card.is-current");if(!card) return;discoverDrag={startX:event.clientX,pointerId:event.pointerId};card.setPointerCapture?.(event.pointerId);});
app.addEventListener("pointermove",event=>{if(!discoverDrag||event.pointerId!==discoverDrag.pointerId) return;paintDiscoverDrag(event.clientX-discoverDrag.startX);});
app.addEventListener("pointerup",event=>endDiscoverDrag(event));
app.addEventListener("pointercancel",event=>endDiscoverDrag(event,true));

render({welcome:true});
setTimeout(()=>document.querySelector(".welcome")?.classList.add("is-leaving"),2200);
setTimeout(()=>document.querySelector(".welcome")?.remove(),2800);
