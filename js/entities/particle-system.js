// Lightweight particle system: hit sparks, death bursts, tap ripples, level confetti.
// All drawn with additive blending for the bioluminescent look.

const MAX_PARTICLES = 400;

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.ripples = [];
  }

  spawnHitSparks(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      this.push({
        x, y, color,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.5) * 220,
        life: 0.35 + Math.random() * 0.2,
        size: 2 + Math.random() * 2.5,
        drag: 3.5,
      });
    }
  }

  /** Bug death: bigger burst that floats upward like released fireflies. */
  spawnKillBurst(x, y, color, bugSize) {
    const count = Math.min(14 + Math.floor(bugSize / 5), 26);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      this.push({
        x, y, color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30, // slight upward bias
        life: 0.6 + Math.random() * 0.7,
        size: 2.5 + Math.random() * 3.5,
        drag: 2.2,
        floaty: true,
      });
    }
    this.ripples.push({ x, y, color, r: bugSize * 0.4, maxR: bugSize * 1.6, life: 0.45, maxLife: 0.45 });
  }

  /** Tap that hit nothing — a soft ripple, no punishment. */
  spawnMissRipple(x, y, color) {
    this.ripples.push({ x, y, color, r: 6, maxR: 34, life: 0.35, maxLife: 0.35 });
  }

  /** Level-up celebration: gentle light confetti across the top. */
  spawnLevelConfetti(w, color) {
    for (let i = 0; i < 40; i++) {
      this.push({
        x: Math.random() * w,
        y: -10,
        color,
        vx: (Math.random() - 0.5) * 40,
        vy: 60 + Math.random() * 90,
        life: 1.6 + Math.random() * 1.2,
        size: 2 + Math.random() * 3,
        drag: 0.4,
      });
    }
  }

  push(p) {
    if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
    p.maxLife = p.life;
    this.particles.push(p);
  }

  update(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      const drag = Math.max(1 - p.drag * dt, 0);
      p.vx *= drag;
      p.vy *= drag;
      if (p.floaty) p.vy -= 55 * dt; // drift upward like embers
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const r of this.ripples) r.life -= dt;
    this.ripples = this.ripples.filter((r) => r.life > 0);
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + t * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    for (const r of this.ripples) {
      const t = r.life / r.maxLife;
      const radius = r.r + (r.maxR - r.r) * (1 - t);
      ctx.globalAlpha = t * 0.8;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
