class AsciiHeroAnimation extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<canvas class="ascii-hero" role="img" aria-label="字元格點構成工作、簡報、料理與海邊四幕動畫"></canvas>';
    this.canvas = this.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.mask = document.createElement('canvas');
    this.mctx = this.mask.getContext('2d', { willReadFrequently: true });
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.origin = performance.now();
    this.pausedAt = null;
    this.visible = true;
    this.frameInterval = 1000 / 8;
    this.lastPaint = -Infinity;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this);
    this.intersectionObserver = new IntersectionObserver(entries => {
      this.visible = entries[0]?.isIntersecting ?? true;
      this.visible ? this.start() : this.stop();
    });
    this.intersectionObserver.observe(this);
    this.onVisibility = () => document.hidden ? this.stop() : this.start();
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
    this.start();
  }

  disconnectedCallback() {
    this.stop();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  resize() {
    const rect = this.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.w = Math.round(rect.width);
    this.h = Math.round(rect.height);
    const ratio = 1;
    this.canvas.width = Math.round(this.w * ratio);
    this.canvas.height = Math.round(this.h * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.mask.width = 700;
    this.mask.height = 450;
    this.padding = 12;
    this.cols = Math.max(24, Math.floor((this.w - this.padding * 2) / 8));
    this.rows = Math.max(24, Math.floor((this.h - this.padding * 2) / 11));
    const cw = (this.w - this.padding * 2) / this.cols;
    const ch = (this.h - this.padding * 2) / this.rows;
    this.cellFont = `500 ${Math.max(8, Math.min(cw * 1.45, ch * 1.06))}px "Roboto Mono", "Courier New", monospace`;
    this.cells = Array.from({ length: this.cols * this.rows }, (_, i) => {
      const col = i % this.cols, row = Math.floor(i / this.cols);
      return {
        col, row,
        x: this.padding + (col + .5) * cw,
        y: this.padding + (row + .5) * ch,
        transitionOffset: (col / this.cols) * .22 + (this.noise(i, 13) - .5) * .14
      };
    });
    this.frames = [0, 1, 2, 3].map(scene => this.makeFrame(scene));
    this.lastPaint = -Infinity;
  }

  start() {
    if (!this.raf && this.visible && !document.hidden) this.raf = requestAnimationFrame(t => this.render(t));
  }

  stop() { cancelAnimationFrame(this.raf); this.raf = 0; this.lastPaint = -Infinity; }

  pause() {
    if (this.pausedAt !== null) return;
    this.pausedAt = performance.now();
    this.stop();
  }

  resume() {
    if (this.pausedAt === null) return;
    this.origin += performance.now() - this.pausedAt;
    this.pausedAt = null;
    this.start();
  }

  render(time) {
    this.raf = 0;
    if (!this.frames) return this.start();
    if (time - this.lastPaint < this.frameInterval) return this.start();
    this.lastPaint = time;
    const holds = [2600, 2600, 3400, 3400];
    const dissolve = 2100;
    const total = holds.reduce((a, b) => a + b + dissolve, 0);
    let clock = (this.reduced.matches ? 0 : time - this.origin) % total;
    let scene = 0, next = 0, blend = 0;
    for (; scene < 4; scene++) {
      if (clock < holds[scene]) break;
      clock -= holds[scene];
      if (clock < dissolve) { next = (scene + 1) % 4; blend = clock / dissolve; break; }
      clock -= dissolve;
    }
    if (scene === 4) scene = 0;
    const moving = next !== scene;
    const sceneState = moving ? `${scene + 1}-to-${next + 1}` : `${scene + 1}`;
    if (this.dataset.scene !== sceneState) this.dataset.scene = sceneState;
    const destination = moving && blend >= .5 ? next : scene;
    if (this.destination !== destination) {
      this.destination = destination;
      this.dispatchEvent(new CustomEvent('scenechange', { bubbles: true, detail: {
        scene: destination,
        category: destination < 2 ? 'Works' : destination === 2 ? 'Foods' : 'Plays'
      } }));
    }
    const style = getComputedStyle(this);
    this.ctx.fillStyle = style.backgroundColor;
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.fillStyle = style.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = this.cellFont;
    const glyphs = ['.', ':', '·', 'v', 'x', 's', 'X', 'M', '@'];
    const phase = time * .001;
    const a = this.frames[scene], b = this.frames[next];
    for (let i = 0; i < a.length; i++) {
      const { col, row, x, y, transitionOffset } = this.cells[i];
      let shade = a[i];
      if (moving) {
        const local = Math.max(0, Math.min(1, (blend - transitionOffset) / .72));
        shade = shade * (1 - local) + b[i] * local;
      }
      if (scene === 2 && !moving) shade += Math.sin(phase * 3 + col * .35 + row * .7) * .035;
      if (scene === 3 && !moving) shade += Math.sin(phase * 1.5 + col * .16 - row * .7) * .045;
      const shimmer = this.reduced.matches ? 0 : Math.sin(phase * 1.8 + col * .27 + row * .19) * .035;
      const value = Math.max(0, Math.min(1, shade + shimmer));
      const level = Math.max(0, Math.min(8, Math.floor(value * 8.8)));
      this.ctx.globalAlpha = .35 + value * .65;
      this.ctx.fillText(glyphs[level], x, y);
    }
    this.ctx.globalAlpha = 1;
    if (!this.reduced.matches && this.pausedAt === null) this.start();
  }

  makeFrame(scene) {
    const c = this.mctx;
    c.clearRect(0, 0, 700, 450);
    c.save();
    c.fillStyle = '#fff';
    c.strokeStyle = '#fff';
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const path = (points, width, alpha = 1) => {
      c.globalAlpha = alpha; c.lineWidth = width; c.beginPath();
      c.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
      c.stroke();
    };
    const ellipse = (x, y, rx, ry, alpha = 1) => {
      c.globalAlpha = alpha; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
    };
    const person = (x, y, scale, pose) => {
      c.save(); c.translate(x, y); c.scale(scale, scale);
      ellipse(4, -112, 42, 56, .82);
      ellipse(15, -107, 26, 37, .15);
      c.globalAlpha=.48; c.beginPath(); c.moveTo(-34,-55); c.bezierCurveTo(-81,-28,-82,82,-53,131); c.lineTo(65,131); c.bezierCurveTo(86,58,55,-44,28,-52); c.closePath(); c.fill();
      c.globalAlpha=.23; c.beginPath(); c.moveTo(-20,-40); c.lineTo(39,-31); c.lineTo(48,112); c.lineTo(-33,109); c.closePath(); c.fill();
      if (pose==='work') {
        path([-39,-28,-65,30,-111,65,-159,72],24,.66);
        path([45,-22,46,22,5,70,-42,82],22,.75);
      } else {
        path([-36,-28,-64,28,-46,87],23,.66);
        path([40,-27,76,11,122,-10,169,-33],22,.74);
      }
      c.restore();
    };
    if (scene === 0) {
      person(492, 208, 1.06, 'work');
      c.globalAlpha = .55; c.beginPath(); c.moveTo(76,175); c.lineTo(312,148); c.lineTo(340,305); c.lineTo(118,326); c.closePath(); c.fill();
      c.globalAlpha = .15; c.beginPath(); c.moveTo(99,183); c.lineTo(300,165); c.lineTo(323,291); c.lineTo(130,307); c.closePath(); c.fill();
      path([100,329,354,326,374,340], 14, .82);
      path([378,342,615,342], 5, .28);
    } else if (scene === 1) {
      person(170, 220, 1.04, 'present');
      c.globalAlpha = .42; c.fillRect(325,123,320,182);
      c.globalAlpha = .12; c.fillRect(342,140,286,150);
      for (let i = 0; i < 5; i++) path([355,160+i*29,570-(i%2)*66,160+i*29], 10-i, .4+i*.08);
      path([325,322,650,322], 4, .35);
    } else if (scene === 2) {
      c.globalAlpha=.55; c.fillRect(203,207,300,158);
      c.globalAlpha=.18; c.fillRect(222,213,262,127);
      c.globalAlpha=.78; c.fillRect(190,195,326,22);
      c.globalAlpha=.5; c.fillRect(213,361,280,13);
      path([190,254,127,254],16,.55); path([516,254,579,254],16,.55);
      path([438,199,512,100],12,.75);
      for (let i = 0; i < 7; i++) ellipse(175+i*65,185-Math.sin(i*.55)*95,12+(i%3)*5,10+(i%2)*7,.35+i*.08);
      for (let i = 0; i < 3; i++) path([256+i*70,260,239+i*72,207,257+i*64,164], 9, .22);
    } else {
      ellipse(165,129,67,67,.28);
      ellipse(165,129,99,99,.08);
      for (let i = 0; i < 3; i++) {
        ellipse(430+i*55,128-(i%2)*15,48,17,.18+i*.08);
      }
      for (let row = 0; row < 5; row++) {
        c.globalAlpha = .2+row*.13; c.lineWidth = 9+row*3; c.beginPath();
        for (let x = 56; x < 650; x += 5) {
          const y = 252+row*31+Math.sin(x*.022+row*.63)*12;
          x === 56 ? c.moveTo(x,y) : c.lineTo(x,y);
        }
        c.stroke();
      }
    }
    c.restore();
    const data = c.getImageData(0,0,700,450).data;
    const result = [];
    for (let row=0; row<this.rows; row++) for (let col=0; col<this.cols; col++) {
      const x=Math.round((col+.5)/this.cols*699), y=Math.round((row+.5)/this.rows*449);
      let sum=0;
      for (const offset of [[0,0],[-3,0],[3,0],[0,-3],[0,3]]) {
        const px=Math.max(0,Math.min(699,x+offset[0]));
        const py=Math.max(0,Math.min(449,y+offset[1]));
        sum+=data[(py*700+px)*4+3]/255;
      }
      const subject=Math.min(1,sum/5);
      const nx=col/this.cols, ny=row/this.rows;
      const texture=.22+.12*Math.sin(nx*15+scene*2)*Math.cos(ny*13-scene)+.1*this.noise(col+scene*73,row*3);
      const vignette=.75+.25*Math.sin(Math.PI*nx)*Math.sin(Math.PI*ny);
      result.push(Math.max(.07,Math.min(1,(texture+subject*.77)*vignette)));
    }
    return result;
  }

  noise(x,y) { const v=Math.sin(x*12.9898+y*78.233)*43758.5453; return v-Math.floor(v); }
}
if (!customElements.get('ascii-hero-animation')) customElements.define('ascii-hero-animation', AsciiHeroAnimation);
