const siteHeaderRoot = new URL("../../", document.currentScript.src);

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") || "";
    this.innerHTML = `
      <header class="site-header" data-expanded="false">
        <div class="site-header__bar">
          <div class="site-header__container">
            <a class="site-header__logo" href="${siteHeaderRoot.href}" aria-label="Charlotte’s Playground 首頁">
              <img class="site-header__logo-frame" src="${new URL("assets/brand/logo-frame.svg", siteHeaderRoot).href}" alt="">
              <img class="site-header__logo-charlottes" src="${new URL("assets/brand/charlottes.svg", siteHeaderRoot).href}" alt="">
              <img class="site-header__logo-playground" src="${new URL("assets/brand/playground.svg", siteHeaderRoot).href}" alt="">
            </a>
            <nav class="site-header__nav" aria-label="主要導覽">
              ${this.link("works", "Works", current)}
              ${this.link("foods", "Foods", current)}
              ${this.link("plays", "Plays", current)}
            </nav>
            <button class="site-header__menu-control icon-state-layer" type="button" aria-label="展開導覽選單" aria-expanded="false" aria-controls="site-mobile-menu">
              <app-icon name="menu"></app-icon>
            </button>
          </div>
        </div>
        <div class="site-header__megamenu" id="site-mobile-menu">
          <nav class="site-header__megamenu-inner" aria-label="行動版主要導覽">
            ${this.link("works", "Works", current, true)}
            ${this.link("foods", "Foods", current, true)}
            ${this.link("plays", "Plays", current, true)}
          </nav>
        </div>
      </header>`;

    this.header = this.querySelector(".site-header");
    this.control = this.querySelector(".site-header__menu-control");
    this.control.addEventListener("click", () => this.toggle());

    this.scrollAnchor = Math.max(window.scrollY, 0);
    this.scrollTicking = false;
    this.onScroll = () => {
      if (this.scrollTicking) return;
      this.scrollTicking = true;
      window.requestAnimationFrame(() => {
        this.updateScrollState();
        this.scrollTicking = false;
      });
    };
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.onScroll);
  }

  link(key, label, current, mobile = false) {
    const className = mobile ? "site-header__mobile-link" : "site-header__link";
    const href = new URL(`#${key}`, siteHeaderRoot).href;
    const active = current === key ? ' aria-current="page"' : "";
    return `<a class="${className}" href="${href}"${active}>${label}</a>`;
  }

  toggle(force) {
    const isExpanded = typeof force === "boolean" ? force : !this.header.classList.contains("is-expanded");
    if (isExpanded) this.setScrollHidden(false);
    this.header.classList.toggle("is-expanded", isExpanded);
    this.header.dataset.expanded = String(isExpanded);
    this.control.setAttribute("aria-expanded", String(isExpanded));
    this.control.setAttribute("aria-label", isExpanded ? "收合導覽選單" : "展開導覽選單");
    this.control.querySelector("app-icon").setAttribute("name", isExpanded ? "close" : "menu");
  }

  updateScrollState() {
    const currentScroll = Math.max(window.scrollY, 0);

    if (currentScroll <= 8 || this.header.classList.contains("is-expanded")) {
      this.setScrollHidden(false);
      this.scrollAnchor = currentScroll;
      return;
    }

    const distance = currentScroll - this.scrollAnchor;
    if (distance >= 8) {
      this.setScrollHidden(true);
      this.scrollAnchor = currentScroll;
    } else if (distance <= -8) {
      this.setScrollHidden(false);
      this.scrollAnchor = currentScroll;
    }
  }

  setScrollHidden(hidden) {
    this.header.classList.toggle("is-scroll-hidden", hidden);
  }
}

if (!customElements.get("site-header")) customElements.define("site-header", SiteHeader);
