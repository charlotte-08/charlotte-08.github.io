/* One icon registry for the whole site. Geometry is copied exactly from the
 * Figma 32×32 master components; state wrappers control rendered size/color. */
const iconPaths = Object.freeze({
  "arrow-up-right": ["M26 20H24V9.41406L6.70703 26.707L5.29297 25.293L22.5859 8H12V6H26V20Z"],
  "arrow-up": ["M25.707 14.293L24.293 15.707L17 8.41406V28H15V8.41406L7.70703 15.707L6.29297 14.293L16 4.58594L25.707 14.293Z"],
  "arrow-right": ["M28.4141 16L18.707 25.707L17.293 24.293L24.5859 17H5V15H24.5859L17.293 7.70703L18.707 6.29297L28.4141 16Z"],
  "arrow-down": ["M17 4V23.5859L24.293 16.293L25.707 17.707L16 27.4141L6.29297 17.707L7.70703 16.293L15 23.5859V4H17Z"],
  "arrow-left": ["M15.707 7.70703L8.41406 15H28V17H8.41406L15.707 24.293L14.293 25.707L4.58594 16L14.293 6.29297L15.707 7.70703Z"],
  close: [
    "M25.707 24.293L24.293 25.707L6.29297 7.70703L7.70703 6.29297L25.707 24.293Z",
    "M6.29297 24.293L7.70703 25.707L25.707 7.70703L24.293 6.29297L6.29297 24.293Z"
  ],
  menu: [
    "M26 8V10H6V8H26Z",
    "M26 15V17L10 17V15L26 15Z",
    "M26 22L26 24L18 24L18 22L26 22Z"
  ]
});

class AppIcon extends HTMLElement {
  static get observedAttributes() { return ["name"]; }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const paths = iconPaths[this.getAttribute("name") || ""];
    this.setAttribute("aria-hidden", "true");
    if (!paths) {
      this.replaceChildren();
      return;
    }
    this.innerHTML = `<svg viewBox="0 0 32 32" focusable="false">${paths.map(path => `<path d="${path}"></path>`).join("")}</svg>`;
  }
}

if (!customElements.get("app-icon")) customElements.define("app-icon", AppIcon);
