// Spawns power-up orbs on a randomized timer and routes hits to them.
// Only one orb exists at a time; orbs appear from MIN_LEVEL onward.

import { randomSuperWeapon } from '../config/super-weapons-config.js';
import { PowerUpOrb } from '../entities/power-up-orb.js';

const FIRST_DELAY = 12;  // seconds until the first orb can appear
const MIN_GAP = 18;      // seconds between orbs...
const RAND_GAP = 14;     // ...plus up to this much randomness
const MIN_LEVEL = 2;
const EDGE_MARGIN = 90;  // keep orbs comfortably inside the screen
const HUD_SAFE_TOP = 110;

export class PowerUpManager {
  constructor() {
    this.orb = null;
    this.timer = FIRST_DELAY;
  }

  update(dt, level, bounds) {
    if (this.orb) {
      this.orb.update(dt);
      if (this.orb.dead) this.orb = null;
      return;
    }
    if (level < MIN_LEVEL) return;

    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = MIN_GAP + Math.random() * RAND_GAP;

    const x = EDGE_MARGIN + Math.random() * (bounds.w - EDGE_MARGIN * 2);
    const y = HUD_SAFE_TOP + Math.random() * (bounds.h - HUD_SAFE_TOP - EDGE_MARGIN);
    this.orb = new PowerUpOrb(x, y, randomSuperWeapon());
  }

  /**
   * Try to hit the orb at a tap point.
   * @returns {null | {broken: boolean, superDef: object, x: number, y: number, color: string}}
   */
  tryHit(x, y) {
    if (!this.orb || this.orb.dead || !this.orb.containsPoint(x, y)) return null;
    const orb = this.orb;
    const broken = orb.takeHit();
    return { broken, superDef: orb.superDef, x: orb.x, y: orb.y, color: orb.superDef.color };
  }

  draw(ctx, time, assets = null) {
    if (this.orb) this.orb.draw(ctx, time, assets?.superIcons[this.orb.superDef.id]);
  }
}
