// A glowing crystal orb carrying a super weapon. Floats gently, must be shot
// ORB_HP times to break; despawns quietly if ignored.

import { getGlowSprite } from '../render/glow-sprite-cache.js';

const ORB_HP = 2;
const LIFETIME = 10;   // seconds on screen
const FADE_OUT = 1.2;  // seconds of fade before despawn

export class PowerUpOrb {
  constructor(x, y, superDef) {
    this.x = x;
    this.y = y;
    this.superDef = superDef;
    this.hp = ORB_HP;
    this.age = 0;
    this.flashT = 0;
    this.dead = false;    // gone for any reason
    this.broken = false;  // shattered by the player
    this.phase = Math.random() * Math.PI * 2;
  }

  get hitRadius() {
    return 42; // generous tap target
  }

  update(dt) {
    this.age += dt;
    this.flashT = Math.max(0, this.flashT - dt);
    if (this.age >= LIFETIME) this.dead = true;
  }

  /** Returns true when the orb breaks open. */
  takeHit() {
    this.hp -= 1;
    this.flashT = 0.12;
    if (this.hp <= 0) {
      this.broken = true;
      this.dead = true;
      return true;
    }
    return false;
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.hitRadius * this.hitRadius;
  }

  draw(ctx, time, iconSprite = null) {
    const t = time + this.phase;
    const y = this.y + Math.sin(t * 1.6) * 7;
    // fade in on spawn, fade out near despawn
    const fadeIn = Math.min(this.age / 0.4, 1);
    const fadeOut = Math.min((LIFETIME - this.age) / FADE_OUT, 1);
    const alpha = Math.min(fadeIn, fadeOut);
    const pulse = 1 + 0.08 * Math.sin(t * 3);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, y);

    // radiant backing glow
    const glowSize = 110 * pulse;
    ctx.drawImage(getGlowSprite(this.superDef.color), -glowSize / 2, -glowSize / 2, glowSize, glowSize);

    // spinning crystal diamond
    ctx.save();
    ctx.rotate(t * 0.8);
    const r = 26 * pulse;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.72, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.72, 0);
    ctx.closePath();
    ctx.fillStyle = this.flashT > 0 ? '#ffffff' : 'rgba(255,255,255,0.85)';
    ctx.fill();
    ctx.strokeStyle = this.superDef.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // the weapon icon floating inside — image asset when available
    if (iconSprite) {
      ctx.drawImage(iconSprite, -17, -17, 34, 34);
    } else {
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.superDef.icon, 0, 1);
    }

    // crack hint after first hit
    if (this.hp < ORB_HP) {
      ctx.strokeStyle = 'rgba(20,20,40,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.lineTo(2, -2);
      ctx.lineTo(-4, 8);
      ctx.stroke();
    }
    ctx.restore();
  }
}
