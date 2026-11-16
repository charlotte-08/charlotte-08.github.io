class AsciiHeroAnimation extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<canvas class="ascii-hero" role="img" aria-label="由流動字元構成的工作、簡報、料理與海邊情境"></canvas>`;
    this.canvas = this.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    this.startedAt = performance.now();
    this.frame = 0;
    this.isVisible = true;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this);
    this.intersectionObserver = new IntersectionObserver(entries => {
      this.isVisible = entries[0]?.isIntersecting ?? true;
      this.isVisible ? this.start() : this.stop();
    }, { threshold: .01 });
    this.intersectionObserver.observe(this);
    this.onVisibility = () => document.hidden ? this.stop() : this.start();
    document.addEventListener("visibilitychange", this.onVisibility);
    this.resize();
    this.start();
  }

  disconnectedCallback() {
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  resize() {
    const rect = this.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.width = Math.round(rect.width);
    this.height = Math.round(rect.height);
    this.ratio = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.ratio);
    this.canvas.height = Math.round(this.height * this.ratio);
    this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    this.scenes = [this.work(), this.presentation(), this.foods(), this.plays()]
      .map(points => this.rasterize(points));
  }

  start() {
    if (this.frame || !this.isVisible || document.hidden) return;
    this.frame = requestAnimationFrame(time => this.render(time));
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  render(time) {
    this.frame = 0;
    if (!this.scenes?.length) return this.start();
    const reduced = this.reducedMotion.matches;
    const timeline = this.timeline(reduced ? 0 : time - this.startedAt);
    this.dataset.scene = timeline.transition ? `${timeline.from + 1}-to-${timeline.to + 1}` : String(timeline.scene + 1);
    const points = timeline.transition
      ? this.transition(this.scenes[timeline.from], this.scenes[timeline.to], timeline.progress, time)
      : this.animate(this.scenes[timeline.scene], timeline.scene, timeline.motion, time);
    const style = getComputedStyle(this);
    this.ctx.fillStyle = style.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.paint(points, style.color, reduced ? 0 : time);
    if (!reduced) this.start();
  }

  timeline(elapsed) {
    const holds = [2200, 2200, 3200, 3200];
    const transition = 2600;
    const total = holds.reduce((sum, hold) => sum + hold + transition, 0);
    let cursor = ((elapsed % total) + total) % total;
    for (let scene = 0; scene < holds.length; scene += 1) {
      if (cursor < holds[scene]) return { transition: false, scene, motion: cursor / holds[scene] };
      cursor -= holds[scene];
      if (cursor < transition) return { transition: true, from: scene, to: (scene + 1) % 4, progress: this.smooth(cursor / transition) };
      cursor -= transition;
    }
    return { transition: false, scene: 0, motion: 0 };
  }

  work() {
    const p = [];
    this.atmosphere(p, 1, 54);
    const laptop = [[.12,.39],[.45,.34],[.49,.62],[.17,.67]];
    for (let i = 0; i < 4; i += 1) this.line(p, laptop[i], laptop[(i + 1) % 4], 30, .008, 6, .76);
    this.line(p, [.15,.69], [.55,.65], 42, .008, 7, .82);
    this.scatter(p, .31, .51, .16, .105, 58, 2, .18);
    this.ellipse(p, .73, .29, .105, .15, 88, .014, 6, .76, "float");
    this.arc(p, .745, .29, .065, .105, -.45, 2.55, 46, .01, 2, .28);
    this.bezier(p, [.65,.43], [.58,.57], [.61,.75], [.67,.88], 76, .012, 4, .48, "float");
    this.bezier(p, [.81,.42], [.9,.57], [.89,.76], [.84,.88], 76, .012, 5, .56, "float");
    this.bezier(p, [.68,.47], [.64,.52], [.58,.56], [.53,.62], 58, .012, 5, .62, "float");
    this.bezier(p, [.79,.48], [.76,.54], [.69,.59], [.59,.62], 62, .012, 6, .7, "float");
    this.scatter(p, .55, .62, .045, .025, 28, 5, .55);
    return p;
  }

  presentation() {
    const p = [];
    this.atmosphere(p, 2, 58);
    this.ellipse(p, .2, .29, .095, .145, 78, .014, 6, .72, "float");
    this.arc(p, .21, .29, .055, .1, -.2, 2.7, 40, .01, 2, .28);
    this.bezier(p, [.13,.43], [.08,.6], [.12,.78], [.18,.9], 78, .012, 4, .46, "float");
    this.bezier(p, [.27,.42], [.34,.59], [.31,.78], [.27,.9], 78, .012, 5, .54, "float");
    this.bezier(p, [.27,.49], [.36,.5], [.4,.54], [.45,.59], 52, .014, 5, .58, "float");
    this.line(p, [.48,.28], [.88,.28], 72, .006, 5, .66);
    this.line(p, [.48,.38], [.76,.38], 56, .006, 4, .48);
    this.line(p, [.48,.48], [.83,.48], 64, .006, 5, .57);
    this.line(p, [.48,.58], [.7,.58], 46, .006, 3, .39);
    this.line(p, [.48,.69], [.88,.69], 72, .006, 4, .5);
    this.scatter(p, .75, .52, .13, .24, 85, 2, .16);
    return p;
  }

  foods() {
    const p = [];
    this.atmosphere(p, 3, 64);
    this.ellipse(p, .47, .61, .28, .065, 105, .012, 6, .74, "simmer");
    this.arc(p, .47, .62, .28, .245, 0, Math.PI, 125, .014, 5, .62, "simmer");
    this.line(p, [.18,.62], [.1,.67], 28, .012, 5, .52);
    this.line(p, [.76,.62], [.85,.67], 28, .012, 5, .52);
    this.bezier(p, [.29,.44], [.37,.12], [.69,.13], [.82,.4], 145, .02, 6, .68, "toss");
    this.scatter(p, .39, .25, .055, .05, 34, 7, .7, "toss");
    this.scatter(p, .55, .17, .045, .035, 28, 5, .58, "toss");
    this.scatter(p, .7, .27, .06, .045, 36, 6, .66, "toss");
    this.bezier(p, [.37,.54], [.29,.43], [.42,.35], [.35,.22], 52, .018, 2, .3, "steam");
    this.bezier(p, [.48,.53], [.57,.42], [.43,.32], [.53,.19], 56, .018, 3, .36, "steam");
    this.bezier(p, [.59,.54], [.67,.43], [.57,.34], [.68,.24], 48, .018, 2, .28, "steam");
    this.line(p, [.65,.61], [.78,.31], 54, .012, 6, .68, "stir");
    return p;
  }

  plays() {
    const p = [];
    this.atmosphere(p, 4, 56);
    this.ellipse(p, .24, .3, .13, .16, 88, .022, 3, .34, "halo");
    this.ellipse(p, .24, .3, .18, .22, 76, .03, 1, .16, "halo");
    this.cloud(p, .69, .25, .19, 4, .42);
    this.cloud(p, .84, .39, .095, 2, .23);
    this.line(p, [.08,.57], [.92,.57], 105, .015, 2, .28, "wave");
    for (let row = 0; row < 4; row += 1) {
      const y = .65 + row * .075;
      this.wave(p, y, 95, .012 + row * .003, 3 + row, .32 + row * .1);
    }
    this.scatter(p, .52, .68, .38, .18, 110, 2, .18, "wave");
    return p;
  }

  animate(points, scene, motion, time) {
    return points.map((point, index) => {
      const drift = .002 + point.drift * .006;
      let x = point.x + Math.sin(time * .00045 * point.speed + point.phase) * drift;
      let y = point.y + Math.cos(time * .00038 * point.speed + point.phase) * drift;
      if (point.motion === "toss") y += Math.sin(motion * Math.PI * 2 + point.phase) * .012;
      if (point.motion === "steam") y -= ((motion + point.phase / 9) % 1) * .035;
      if (point.motion === "stir") x += Math.sin(motion * Math.PI * 2) * .014;
      if (point.motion === "wave") y += Math.sin(time * .0012 + point.x * 18 + point.phase) * .008;
      if (point.motion === "halo") x += Math.sin(time * .00025 + point.phase) * .006;
      if (point.motion === "pulse") point = { ...point, alpha: point.alpha * (.82 + Math.sin(time * .001 + index) * .18) };
      return { ...point, x, y };
    });
  }

  transition(from, to, progress, time) {
    const count = Math.max(from.length, to.length);
    const points = [];
    for (let index = 0; index < count; index += 1) {
      const a = from[Math.min(from.length - 1, Math.floor(index * from.length / count))];
      const b = to[Math.min(to.length - 1, Math.floor(index * to.length / count))];
      const delay = this.hash(index, 91) * .16;
      const local = this.clamp((progress - delay) / (1 - delay * 1.3), 0, 1);
      const eased = this.smooth(local);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const bend = (this.hash(index, 37) - .5) * Math.min(.045, distance * .16) * Math.sin(eased * Math.PI);
      points.push({
        x: this.mix(a.x, b.x, eased) - dy / distance * bend,
        y: this.mix(a.y, b.y, eased) + dx / distance * bend,
        alpha: this.mix(a.alpha, b.alpha, eased) * (.76 + .24 * Math.abs(Math.cos(eased * Math.PI))),
        level: Math.round(this.mix(a.level, b.level, eased)),
        phase: this.mix(a.phase, b.phase, eased),
        drift: this.mix(a.drift, b.drift, eased),
        speed: this.mix(a.speed, b.speed, eased)
      });
    }
    return this.animate(points, -1, progress, time);
  }

  paint(points, color, time) {
    const size = this.width < 500 ? 8 : 10;
    const glyphs = [".", ":", "'", "-", "+", "=", "*", "#", "@"];
    this.ctx.font = `500 ${size}px "Roboto Mono", "Courier New", monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.ctx.save();
    this.ctx.filter = "blur(2.4px)";
    this.ctx.fillStyle = color;
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const x = (.045 + this.clamp(point.x, 0, 1) * .91) * this.width;
      const y = (.055 + this.clamp(point.y, 0, 1) * .78) * this.height;
      const ghostX = (this.hash(index, 13) - .5) * 7;
      const ghostY = (this.hash(index, 19) - .5) * 7;
      this.ctx.globalAlpha = point.alpha * .2;
      this.ctx.fillText(glyphs[this.clamp(point.level, 0, glyphs.length - 1)], x + ghostX, y + ghostY);
    }
    this.ctx.restore();

    this.ctx.fillStyle = color;
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const x = (.045 + this.clamp(point.x, 0, 1) * .91) * this.width;
      const y = (.055 + this.clamp(point.y, 0, 1) * .78) * this.height;
      const shimmer = Math.round(Math.sin(time * .002 + point.phase + x * .015 + y * .008));
      const level = this.clamp(point.level + shimmer, 0, glyphs.length - 1);
      this.ctx.globalAlpha = point.alpha;
      this.ctx.fillText(glyphs[level], x, y);
    }
    this.ctx.globalAlpha = 1;
  }

  point(list, x, y, spread, level, alpha, motion = "float", seed = list.length) {
    const angle = this.hash(seed, 17) * Math.PI * 2;
    const radius = Math.sqrt(this.hash(seed, 23)) * spread;
    list.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      level,
      alpha,
      motion,
      phase: this.hash(seed, 41) * Math.PI * 2,
      drift: this.hash(seed, 47),
      speed: .7 + this.hash(seed, 59) * .8
    });
  }

  line(list, a, b, count, spread, level, alpha, motion = "float") {
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0 : i / (count - 1);
      this.point(list, this.mix(a[0], b[0], t), this.mix(a[1], b[1], t), spread, level, alpha * (.72 + this.hash(i, count) * .28), motion);
    }
  }

  bezier(list, a, b, c, d, count, spread, level, alpha, motion = "float") {
    for (let i = 0; i < count; i += 1) {
      const t = i / Math.max(1, count - 1);
      const u = 1 - t;
      const x = u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0];
      const y = u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1];
      this.point(list, x, y, spread, level, alpha * (.65 + this.hash(i, count + 3) * .35), motion);
    }
  }

  ellipse(list, cx, cy, rx, ry, count, spread, level, alpha, motion = "float") {
    this.arc(list, cx, cy, rx, ry, 0, Math.PI * 2, count, spread, level, alpha, motion);
  }

  arc(list, cx, cy, rx, ry, start, end, count, spread, level, alpha, motion = "float") {
    for (let i = 0; i < count; i += 1) {
      const t = i / Math.max(1, count - 1);
      const angle = this.mix(start, end, t);
      this.point(list, cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry, spread, level, alpha * (.68 + this.hash(i, count + 5) * .32), motion);
    }
  }

  scatter(list, cx, cy, rx, ry, count, level, alpha, motion = "float") {
    for (let i = 0; i < count; i += 1) {
      const angle = this.hash(i, count + 11) * Math.PI * 2;
      const radius = Math.sqrt(this.hash(i, count + 17));
      this.point(list, cx + Math.cos(angle) * rx * radius, cy + Math.sin(angle) * ry * radius, .008, level, alpha * (.45 + this.hash(i, 71) * .55), motion);
    }
  }

  wave(list, y, count, spread, level, alpha) {
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      this.point(list, .07 + t * .86, y + Math.sin(t * Math.PI * 5) * .025, spread, level, alpha, "wave");
    }
  }

  cloud(list, cx, cy, size, level, alpha) {
    this.arc(list, cx - size * .32, cy, size * .28, size * .2, .7, 4.5, 28, .014, level, alpha, "cloud");
    this.arc(list, cx, cy - size * .14, size * .35, size * .29, 3.1, 6.1, 36, .014, level, alpha, "cloud");
    this.arc(list, cx + size * .36, cy, size * .27, size * .2, 4.9, 8.7, 28, .014, level, alpha, "cloud");
    this.line(list, [cx - size * .48, cy + size * .12], [cx + size * .52, cy + size * .12], 36, .012, level - 1, alpha * .72, "cloud");
  }

  atmosphere(list, scene, count) {
    for (let i = 0; i < count; i += 1) {
      const x = .08 + this.hash(i + scene * 41, 101) * .84;
      const y = .09 + this.hash(i + scene * 67, 109) * .78;
      this.point(list, x, y, .018, Math.floor(this.hash(i, scene) * 3), .08 + this.hash(i, 127) * .14, "float", i + scene * 1000);
    }
  }

  spatialSort(points) {
    return points.sort((a, b) => ((a.x + a.y * .73) - (b.x + b.y * .73)) || (a.x - b.x));
  }

  rasterize(points) {
    const cols = this.width < 500 ? 64 : 96;
    const rows = Math.round(cols * this.height / this.width * .58);
    const cells = new Map();
    for (const point of points) {
      const col = Math.round(this.clamp(point.x, 0, 1) * (cols - 1));
      const row = Math.round(this.clamp(point.y, 0, 1) * (rows - 1));
      const key = row * cols + col;
      const existing = cells.get(key);
      const strength = point.alpha * (point.level + 1);
      if (!existing || strength > existing.strength) cells.set(key, { ...point, x: col / (cols - 1), y: row / (rows - 1), strength });
    }
    return this.spatialSort([...cells.values()]);
  }

  hash(x, y) {
    const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  mix(a, b, t) { return a + (b - a) * t; }
  clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  smooth(t) { return t * t * (3 - 2 * t); }
}

if (!customElements.get("ascii-hero-animation")) customElements.define("ascii-hero-animation", AsciiHeroAnimation);
