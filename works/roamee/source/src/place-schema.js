import { NOW_THEMES, SURPRISE_TAGS, NOW_THEME_OPTIONS, SURPRISE_TAG_OPTIONS, taxonomyIds, NEARBY_CATEGORIES, PLAN_THEMES, PLACE_ENUMS } from "./place-taxonomy.js?v=20260822v";

export const PLACE_SCHEMA_VERSION = 1;
const list = value => Array.isArray(value) ? [...new Set(value.filter(Boolean))] : value ? [value] : [];
const numberOrNull = value => Number.isFinite(Number(value)) ? Number(value) : null;
const score = value => value == null ? null : Math.max(0,Math.min(5,Number(value)));

/** Creates the canonical ROAMEE place record. It accepts current legacy seeds during migration. */
export function createPlace(source={}) {
  const classification=source.classification??{};
  const location=source.location??{};
  const pricing=source.pricing??{};
  const hours=source.hours??{};
  const reservation=source.reservation??{};
  const planning=source.planning??{};
  const attributes=source.attributes??{};
  const scores=source.scores??{};
  const sourceInfo=source.source??{};
  const legacyTags=list(source.tags);
  const canonicalSurpriseTags=legacyTags.filter(tag=>SURPRISE_TAGS.includes(tag));
  const inferredPlanThemes=legacyTags.filter(tag=>PLAN_THEMES.includes(tag));
  const inferredNearbyCategories=legacyTags.filter(tag=>NEARBY_CATEGORIES.includes(tag));
  const inferredPartyTypes=[
    ...(legacyTags.includes("一個人也行")||legacyTags.includes("社恐必去")?["solo"]:[]),
    ...(legacyTags.includes("適合約會")?["couple"]:[]),
    ...(legacyTags.includes("家庭旅遊")?["family"]:[])
  ];
  const legacyImages=source.images??(source.image?[source.image]:[]);
  const media=(source.media??legacyImages).map((item,index)=>typeof item==="string"?{src:item,alt:`${source.name??"景點"} 圖片 ${index+1}`,credit:source.imageCredit??"ROAMEE 編輯部",type:index===0?"cover":"gallery",sortOrder:index+1}:{type:index===0?"cover":"gallery",sortOrder:index+1,...item});

  return {
    schemaVersion:PLACE_SCHEMA_VERSION,
    id:source.id??"",
    slug:source.slug??source.id??"",
    status:source.status??"published",
    name:source.name??"",
    englishName:source.englishName??"",
    aliases:list(source.aliases),
    summary:source.summary??source.description??"",
    introParagraphs:list(source.introParagraphs??source.description),
    searchKeywords:list([...list(source.searchKeywords),...legacyTags]),
    classification:{
      category:classification.category??source.category??"",
      subcategories:list(classification.subcategories??source.subcategories),
      nowThemes:list(classification.nowThemes??source.nowThemes??source.theme),
      nowThemeIds:taxonomyIds(classification.nowThemeIds??classification.nowThemes??source.nowThemeIds??source.nowThemes??source.theme,NOW_THEME_OPTIONS),
      surpriseTags:list(classification.surpriseTags??source.surpriseTags??canonicalSurpriseTags),
      surpriseTagIds:taxonomyIds(classification.surpriseTagIds??classification.surpriseTags??source.surpriseTagIds??source.surpriseTags??canonicalSurpriseTags,SURPRISE_TAG_OPTIONS),
      nearbyCategories:list(classification.nearbyCategories??source.nearbyCategories??inferredNearbyCategories),
      planThemes:list(classification.planThemes??source.planThemes??inferredPlanThemes)
    },
    location:{
      city:location.city??source.city??(String(source.address??"").startsWith("新北市")?"新北市":"台北市"),
      district:location.district??source.district??source.area??"",
      address:location.address??source.address??"",
      postalCode:location.postalCode??source.postalCode??"",
      latitude:numberOrNull(location.latitude??source.latitude),
      longitude:numberOrNull(location.longitude??source.longitude),
      nearestTransit:list(location.nearestTransit??source.nearestTransit),
      mapUrl:location.mapUrl??source.mapUrl??""
    },
    media,
    pricing:{
      isFree:pricing.isFree??source.isFree??source.price===0,
      priceTier:pricing.priceTier??source.price??0,
      averageCost:numberOrNull(pricing.averageCost??source.averageCost),
      minimumCost:numberOrNull(pricing.minimumCost??source.minimumCost),
      maximumCost:numberOrNull(pricing.maximumCost??source.maximumCost),
      admissionText:pricing.admissionText??source.admission??"",
      currency:pricing.currency??"TWD"
    },
    hours:{
      timezone:"Asia/Taipei",
      weeklyHours:hours.weeklyHours??source.weeklyHours??{},
      openingHoursText:hours.openingHoursText??source.openingHours??"",
      closedDates:list(hours.closedDates??source.closedDates),
      lastEntryMinutes:numberOrNull(hours.lastEntryMinutes??source.lastEntryMinutes),
      temporarilyClosed:Boolean(hours.temporarilyClosed??source.temporarilyClosed)
    },
    reservation:{
      required:Boolean(reservation.required??source.reservationRequired),
      available:Boolean(reservation.available??source.reservationAvailable??source.reservationRequired),
      url:reservation.url??source.reservationUrl??""
    },
    planning:{
      recommendedDuration:numberOrNull(planning.recommendedDuration??source.duration),
      minimumDuration:numberOrNull(planning.minimumDuration??source.minimumDuration),
      maximumDuration:numberOrNull(planning.maximumDuration??source.maximumDuration),
      availableTimeSlots:list(planning.availableTimeSlots??source.availableTimeSlots),
      mealTypes:list(planning.mealTypes??source.mealTypes),
      recommendedVisitDays:list(planning.recommendedVisitDays??source.recommendedVisitDays),
      transportAccess:list(planning.transportAccess??source.transportAccess),
      parkingAvailable:planning.parkingAvailable??source.parkingAvailable??null
    },
    attributes:{
      indoorOutdoor:attributes.indoorOutdoor??source.indoorOutdoor??(source.indoor===true?"indoor":source.indoor===false?"outdoor":"mixed"),
      weatherSuitability:list(attributes.weatherSuitability??source.weatherSuitability??(legacyTags.includes("不想曬太陽")?["rainy","hot"]:[])),
      socialEnergy:attributes.socialEnergy??source.socialEnergy??(legacyTags.includes("社恐必去")||legacyTags.includes("一個人也行")?"low":null),
      activityLevel:attributes.activityLevel??source.activityLevel??(legacyTags.includes("爆汗")?"intense":null),
      crowdLevel:attributes.crowdLevel??source.crowdLevel??null,
      queueLikelihood:attributes.queueLikelihood??source.queueLikelihood??(legacyTags.includes("排隊也可以")?"high":null),
      partyTypes:list(attributes.partyTypes??source.partyTypes??inferredPartyTypes),
      petFriendly:attributes.petFriendly??source.petFriendly??(legacyTags.includes("狗狗友善")?true:null),
      accessibility:attributes.accessibility??source.accessibility??null,
      photoFriendly:attributes.photoFriendly??source.photoFriendly??(legacyTags.includes("網紅打卡點")?true:null),
      newness:attributes.newness??source.newness??(legacyTags.includes("新穎")?"new":null),
      seasonality:list(attributes.seasonality??source.seasonality),
      ageRestrictions:attributes.ageRestrictions??source.ageRestrictions??null,
      minimumPartySize:numberOrNull(attributes.minimumPartySize??source.minimumPartySize),
      maximumPartySize:numberOrNull(attributes.maximumPartySize??source.maximumPartySize)
    },
    scores:{
      popularity:score(scores.popularity??source.popularityScore??(legacyTags.includes("熱門")||legacyTags.includes("不能不去的！")?5:null)),
      trend:score(scores.trend??source.trendScore??(legacyTags.includes("潮流酷炫")||legacyTags.includes("網紅打卡點")?4:null)),
      relaxation:score(scores.relaxation??source.relaxationScore??(legacyTags.includes("什麼都不用做只要休息的")?5:null)),
      challenge:score(scores.challenge??source.challengeScore??(legacyTags.includes("挑戰極限")||legacyTags.includes("爆汗")?5:null)),
      localExperience:score(scores.localExperience??source.localExperienceScore??(legacyTags.includes("在地探索")?5:null))
    },
    source:{
      dataSource:sourceInfo.dataSource??source.dataSource??"ROAMEE 編輯部",
      sourceUrl:sourceInfo.sourceUrl??source.sourceUrl??"",
      verifiedAt:sourceInfo.verifiedAt??source.verifiedAt??""
    },
    reviews:list(source.reviews??source.comments),
    createdAt:source.createdAt??"",
    updatedAt:source.updatedAt??""
  };
}

function allowed(values,canonical){return values.filter(value=>!canonical.includes(value));}
export function validatePlace(place,{strict=false}={}) {
  const errors=[];const warnings=[];
  if(!place.id)errors.push("缺少 id");
  if(!place.name)errors.push("缺少 name");
  if(!PLACE_ENUMS.status.includes(place.status))errors.push(`status 不合法：${place.status}`);
  if(!place.summary)warnings.push("缺少卡片簡介 summary");
  if(!place.location.city||!place.location.district||!place.location.address)warnings.push("地址資料不完整");
  if(place.location.latitude==null||place.location.longitude==null)warnings.push("缺少經緯度，無法準確計算距離與路線");
  if(!place.media.length)errors.push("至少需要一張圖片");
  if(place.planning.recommendedDuration==null)warnings.push("缺少建議停留時間");
  const checks=[[place.classification.nowThemes,NOW_THEMES,"現在去哪主題"],[place.classification.surpriseTags,SURPRISE_TAGS,"Surprise 標籤"],[place.classification.nearbyCategories,NEARBY_CATEGORIES,"探索周遭分類"],[place.classification.planThemes,PLAN_THEMES,"一日規劃主題"]];
  for(const [values,canonical,label] of checks){const invalid=allowed(values,canonical);if(invalid.length)warnings.push(`${label}不在字典中：${invalid.join("、")}`);}
  if(strict&&warnings.length)errors.push(...warnings.splice(0));
  return {valid:errors.length===0,errors,warnings};
}

export function validatePlaces(places,options={}) {
  const seen=new Set();
  return places.map(place=>{const result=validatePlace(place,options);if(seen.has(place.id))result.errors.push(`id 重複：${place.id}`);seen.add(place.id);result.valid=result.errors.length===0;return {id:place.id,...result};});
}

/** Temporary adapter: keeps the current prototype UI working while records migrate. */
export function toPrototypePlace(place,{distance=null}={}) {
  const cover=place.media.find(item=>item.type==="cover")??place.media[0]??{};
  return {
    ...place,
    theme:place.classification.nowThemes[0]??"",
    category:place.classification.category,
    area:place.location.district,
    address:place.location.address||`${place.location.city}${place.location.district}`,
    image:cover.src??"",
    images:place.media.map(item=>item.src),
    imageCredit:cover.credit??"ROAMEE 編輯部",
    description:place.summary,
    price:place.pricing.priceTier,
    averageCost:place.pricing.averageCost,
    admission:place.pricing.admissionText||(["免費","低消費","中等消費","較高消費"][place.pricing.priceTier]??"請依現場公告為準"),
    openingHours:place.hours.openingHoursText||"請依現場公告為準",
    reservationRequired:place.reservation.required,
    duration:place.planning.recommendedDuration??90,
    indoor:place.attributes.indoorOutdoor==="indoor",
    tags:place.classification.surpriseTags,
    comments:place.reviews,
    distance
  };
}
