const bracketsButtonRoot = new URL("../../", document.currentScript.src);
const bracketsButtonAsset = name => new URL(`assets/components/brackets-button/${name}.svg`, bracketsButtonRoot).href;

class BracketsButton extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "Works";
    const href = this.getAttribute("href") || "#works";
    this.innerHTML = `
      <a class="brackets-button" href="${href}" aria-label="前往 ${label}">
        <span class="brackets-button__content">
          <span class="brackets-button__bracket">[</span>
          <span class="brackets-button__label">${label}</span>
          <span class="brackets-button__icon" aria-hidden="true">
            <img class="is-default is-mobile" src="${bracketsButtonAsset("mobile-default-arrow")}" alt="">
            <img class="is-hover is-mobile" src="${bracketsButtonAsset("mobile-hover-arrow")}" alt="">
            <img class="is-pressed is-mobile" src="${bracketsButtonAsset("mobile-pressed-arrow")}" alt="">
            <img class="is-default is-desktop" src="${bracketsButtonAsset("desktop-default-arrow")}" alt="">
            <img class="is-hover is-desktop" src="${bracketsButtonAsset("desktop-hover-arrow")}" alt="">
            <img class="is-pressed is-desktop" src="${bracketsButtonAsset("desktop-pressed-arrow")}" alt="">
          </span>
          <span class="brackets-button__bracket">]</span>
        </span>
        <span class="brackets-button__underline" aria-hidden="true">
          <img class="is-hover is-mobile" src="${bracketsButtonAsset("mobile-hover-underline")}" alt="">
          <img class="is-pressed is-mobile" src="${bracketsButtonAsset("mobile-pressed-underline")}" alt="">
          <img class="is-hover is-desktop" src="${bracketsButtonAsset("desktop-hover-underline")}" alt="">
          <img class="is-pressed is-desktop" src="${bracketsButtonAsset("desktop-pressed-underline")}" alt="">
        </span>
      </a>`;
  }

  setDestination(label, href) {
    this.setAttribute('label', label);
    this.setAttribute('href', href);
    const link = this.querySelector('.brackets-button');
    if (!link) return;
    link.href = href;
    link.setAttribute('aria-label', `前往 ${label}`);
    this.querySelector('.brackets-button__label').textContent = label;
  }
}

if (!customElements.get("brackets-button")) customElements.define("brackets-button", BracketsButton);
