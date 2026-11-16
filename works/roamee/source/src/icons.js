/**
 * ROAMEE icon library
 *
 * All application glyphs are resolved here so screens never hard-code an
 * asset path. Stateful and multi-layer Figma icons are exposed as components.
 */
const assets = Object.freeze({
  menuLine:"assets/icons/menu-line.svg",
  surprise:"assets/icons/surprise.png",
  search:"assets/figma/plan-search.svg",
  back:"assets/figma/back.png",
  chevronRight:"assets/figma/chevron-right-exact.svg",
  closeA:"assets/figma/plan-close-a.svg",
  closeB:"assets/figma/plan-close-b.svg",
  timerUp:"assets/figma/plan-timer-up.svg",
  timerDown:"assets/figma/plan-timer-down.svg",
  addRing:"assets/figma/plan-add-ring.svg",
  addH:"assets/figma/plan-add-h.svg",
  addV:"assets/figma/plan-add-v.svg",
  reviewRing:"assets/figma/add-circle.svg",
  reviewH:"assets/figma/add-horizontal.svg",
  reviewV:"assets/figma/add-vertical.svg",
  themeRing:"assets/figma/plan-check-ring.png",
  themeSelected:"assets/figma/plan-check-selected.svg",
  themeCheck:"assets/figma/plan-check.svg",
  ctaLine:"assets/figma/plan-cta-line.svg",
  ctaUp:"assets/figma/plan-cta-up.svg",
  ctaDown:"assets/figma/plan-cta-down.svg",
  heartDefault:"assets/figma/heart-default.svg",
  heartSelected:"assets/figma/heart-selected.svg",
  heartCollectionSelected:"assets/figma/heart-collection-selected.svg",
  changePhoto:"assets/figma/change-photo.svg",
  faqDown:"assets/figma/faq-chevron-down.svg",
  faqRightFill:"assets/figma/faq-chevron-right-fill.svg",
  faqRightStroke:"assets/figma/faq-chevron-right-stroke.svg",
  mail:"assets/figma/mail.svg",
  linkLeft:"assets/figma/link-left.svg",
  linkRight:"assets/figma/link-right.svg",
  linkMiddle:"assets/figma/link-middle.svg",
  toastCheck:"assets/figma/toast-check.svg",
  chipCloseA:"assets/figma/chip-close-a.svg",
  chipCloseB:"assets/figma/chip-close-b.svg",
  sheetAddRing:"assets/figma/sheet-add-ring.svg",
  sheetAddH:"assets/figma/sheet-add-h.svg",
  sheetAddV:"assets/figma/sheet-add-v.svg",
  kickPersonHead:"assets/figma/kick-person-head.svg",
  kickPersonBody:"assets/figma/kick-person-body.svg",
  kickPersonMark:"assets/figma/kick-person-mark.svg",
  moreDots:"assets/figma/more-dots.svg",
  visibilityOpenOutline:"assets/figma/visibility-open-outline.svg",
  visibilityOpenPupil:"assets/figma/visibility-open-pupil.svg",
  visibilityClosedOutline:"assets/figma/visibility-closed-outline.svg",
  visibilityClosedPupil:"assets/figma/visibility-closed-pupil.svg",
  visibilityClosedSlash:"assets/figma/visibility-closed-slash.svg",
  transportWalk:"assets/figma/transport-walk.png",
  transportTransit:"assets/figma/transport-transit.png",
  transportBike:"assets/figma/transport-bike.png",
  transportScooter:"assets/figma/transport-scooter.png",
  transportCar:"assets/figma/transport-car.png"
});

const esc = value => String(value).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");

export function icon(name,{className="",alt=""}={}){
  const src=assets[name];
  if(!src) throw new Error(`Unknown ROAMEE icon: ${name}`);
  return `<img${className?` class="${esc(className)}"`:""} src="${src}" alt="${esc(alt)}" />`;
}

export function menuIcon(){return `<span class="app-icon app-icon--menu" aria-hidden="true">${icon("menuLine")}${icon("menuLine")}${icon("menuLine")}</span>`;}
export function themeCheckIcon(selected=false){return `<span class="app-icon app-icon--theme-check" aria-hidden="true">${icon(selected?"themeSelected":"themeRing")}${icon("themeCheck")}</span>`;}
export function ctaArrowIcon(){return `<span class="app-icon app-icon--cta-arrow" aria-hidden="true">${icon("ctaLine")}${icon("ctaUp")}${icon("ctaDown")}</span>`;}
export function closeIcon(){return `<span class="app-icon app-icon--close" aria-hidden="true"><span class="app-icon__canvas">${icon("closeA")}${icon("closeB")}</span></span>`;}
export function linkIcon(){return `<span class="app-icon app-icon--link" aria-hidden="true">${icon("linkLeft")}${icon("linkRight")}${icon("linkMiddle")}</span>`;}
export function toastCheckIcon(){return `<span class="app-icon app-icon--toast-check" aria-hidden="true">${icon("toastCheck")}</span>`;}
export function chipCloseIcon(){return `<span class="app-icon app-icon--chip-close" aria-hidden="true">${icon("chipCloseA")}${icon("chipCloseB")}</span>`;}
export function sheetAddIcon(){return `<span class="app-icon app-icon--sheet-add" aria-hidden="true">${icon("sheetAddRing")}${icon("sheetAddH")}${icon("sheetAddV")}</span>`;}
export function kickPersonIcon(){return `<span class="app-icon app-icon--kick-person" aria-hidden="true">${icon("kickPersonHead")}${icon("kickPersonBody")}${icon("kickPersonMark")}</span>`;}
export function moreIcon(){return `<span class="app-icon app-icon--more" aria-hidden="true">${icon("moreDots")}</span>`;}
export function visibilityIcon(visible=false){return `<span class="app-icon app-icon--visibility" aria-hidden="true">${icon(visible?"visibilityOpenOutline":"visibilityClosedOutline")}${icon(visible?"visibilityOpenPupil":"visibilityClosedPupil")}${visible?"":icon("visibilityClosedSlash")}</span>`;}
export function addIcon(kind="plan"){
  const prefix=kind==="review"?"review":"add";
  return `<span class="app-icon app-icon--add app-icon--add-${kind}" aria-hidden="true">${icon(`${prefix}Ring`)}${icon(`${prefix}H`)}${icon(`${prefix}V`)}</span>`;
}
export function heartIcon(selected=false,light=false){return icon(light&&selected?"heartCollectionSelected":selected?"heartSelected":"heartDefault");}

export { assets as iconAssets };
