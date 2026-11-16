class S03HeroHome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="s03-hero-home" aria-labelledby="home-hero-title">
        <h1 class="s03-hero-home__title s03-hero-home__title--top" id="home-hero-title">Charlotte’s</h1>
        <div class="s03-hero-home__stage">
          <ascii-hero-animation></ascii-hero-animation>
        </div>
        <p class="s03-hero-home__title s03-hero-home__title--bottom" aria-hidden="true">Playground</p>
        <div class="s03-hero-home__meta">
          <p class="s03-hero-home__signature">Charlotte’s</p>
          <span class="s03-hero-home__rule" aria-hidden="true"></span>
          <brackets-button label="Works" href="#works"></brackets-button>
        </div>
        <span class="s03-hero-home__rule s03-hero-home__rule--vertical" aria-hidden="true"></span>
      </section>`;

    this.animation = this.querySelector('ascii-hero-animation');
    this.destinationButton = this.querySelector('brackets-button');
    this.onSceneChange = event => {
      const category = event.detail.category;
      this.destinationButton.setDestination(category, `#${category.toLowerCase()}`);
    };
    this.onPointerEnter = () => this.animation.pause();
    this.onPointerLeave = () => this.animation.resume();
    this.animation.addEventListener('scenechange', this.onSceneChange);
    this.destinationButton.addEventListener('pointerenter', this.onPointerEnter);
    this.destinationButton.addEventListener('pointerleave', this.onPointerLeave);
  }

  disconnectedCallback() {
    this.animation?.removeEventListener('scenechange', this.onSceneChange);
    this.destinationButton?.removeEventListener('pointerenter', this.onPointerEnter);
    this.destinationButton?.removeEventListener('pointerleave', this.onPointerLeave);
  }
}

if (!customElements.get("s03-hero-home")) customElements.define("s03-hero-home", S03HeroHome);
