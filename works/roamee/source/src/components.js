const buttonEsc=value=>String(value).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");

/** Shared button renderer based on Figma component 119:2956. */
export function uiButton(label,{variant="primary",width="standard",action="",disabled=false,className=""}={}){
  return `<button class="ui-button ui-button--${variant} ui-button--${width}${className?` ${buttonEsc(className)}`:""}"${action?` data-action="${buttonEsc(action)}"`:""}${disabled?" disabled":""}>${buttonEsc(label)}</button>`;
}
