// Night garden background. Uses assets/images/background.png when available,
// otherwise paints a procedural scene: sky gradient, moon, stars, hill
// silhouettes, plus drifting light motes for depth (always procedural).

const STAR_COUNT = 60;
const MOTE_COUNT = 18;

export class NightBackgroundPainter {
  constructor(image = null) {
    this.image = image;
    this.stars = [];
    this.motes = [];
    this.staticLayer = null; // offscreen canvas with the non-animated parts
  }

  /** (Re)generate star/mote positions and pre-render static scenery. */
  layout(w, h) {
    this.stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.7,
      size: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    }));
    this.motes = Array.from({ length: MOTE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 1 + Math.random() * 2.5,
      speed: 4 + Math.random() * 9,
      phase: Math.random() * Math.PI * 2,
    }));
    this.renderStaticLayer(w, h);
  }

  renderStaticLayer(w, h) {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const ctx = off.getContext('2d');

    if (this.image) {
      // cover-fit the user's background image, then darken edges slightly
      const scale = Math.max(w / this.image.width, h / this.image.height);
      const iw = this.image.width * scale;
      const ih = this.image.height * scale;
      ctx.drawImage(this.image, (w - iw) / 2, (h - ih) / 2, iw, ih);
    } else {
      // sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#0d1440');
      sky.addColorStop(0.6, '#0a102e');
      sky.addColorStop(1, '#050914');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // moon glow (top-right)
      const moon = ctx.createRadialGradient(w * 0.8, h * 0.16, 8, w * 0.8, h * 0.16, w * 0.24);
      moon.addColorStop(0, 'rgba(235, 242, 255, 0.85)');
      moon.addColorStop(0.12, 'rgba(200, 218, 255, 0.28)');
      moon.addColorStop(1, 'rgba(200, 218, 255, 0)');
      ctx.fillStyle = moon;
      ctx.fillRect(0, 0, w, h);

      // layered hill / foliage silhouettes at the bottom
      this.drawHill(ctx, w, h, h * 0.86, '#081024', 0.9);
      this.drawHill(ctx, w, h, h * 0.93, '#04070f', 1);
    }

    // gentle vignette keeps the play area focused (both modes)
    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(2,4,12,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    this.staticLayer = off;
  }

  drawHill(ctx, w, h, baseY, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, baseY);
    // wavy silhouette built from a few arcs
    for (let x = 0; x <= w; x += w / 6) {
      const bump = Math.sin(x * 0.011 + baseY) * h * 0.035;
      ctx.quadraticCurveTo(x + w / 12, baseY - h * 0.05 + bump, x + w / 6, baseY + bump * 0.4);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  draw(ctx, w, h, time) {
    if (!this.staticLayer) this.layout(w, h);
    ctx.drawImage(this.staticLayer, 0, 0);

    // twinkling stars (skip when a photo background is present)
    if (!this.image) {
      ctx.save();
      ctx.fillStyle = '#dfe8ff';
      for (const s of this.stars) {
        ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(time * 1.4 + s.phase));
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.restore();
    }

    // drifting glowing motes — the "atmosphere" layer
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const m of this.motes) {
      const y = (m.y - time * m.speed) % (h + 40);
      const drawY = y < -20 ? y + h + 40 : y;
      const x = m.x + Math.sin(time * 0.4 + m.phase) * 24;
      ctx.globalAlpha = 0.12 + 0.1 * Math.sin(time + m.phase);
      ctx.fillStyle = '#bcd8ff';
      ctx.shadowColor = '#bcd8ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, drawY, m.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
