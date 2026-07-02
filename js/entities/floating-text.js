// Floating score popups ("+30 ×2") that rise and fade above killed bugs.

export class FloatingTextSystem {
  constructor() {
    this.items = [];
  }

  add(text, x, y, color = '#ffe9a8', size = 20) {
    this.items.push({ text, x, y, color, size, life: 1.1, maxLife: 1.1 });
  }

  update(dt) {
    for (const item of this.items) {
      item.life -= dt;
      item.y -= 42 * dt; // rise
    }
    this.items = this.items.filter((i) => i.life > 0);
  }

  draw(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    for (const item of this.items) {
      const t = item.life / item.maxLife;
      ctx.globalAlpha = Math.min(t * 1.5, 1);
      ctx.font = `700 ${item.size}px "Segoe UI", system-ui, sans-serif`;
      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 12;
      ctx.fillText(item.text, item.x, item.y);
    }
    ctx.restore();
  }
}
