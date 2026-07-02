// Frenzy waves: every ~75-90s a swarm of bonus fireflies floods the screen
// for a few seconds. They're pure candy — killing them scores normally, but
// an escaping bonus bug costs nothing (no life, no combo break).

import { BUG_TYPES } from '../config/bug-types-config.js';
import { BugEntity } from '../entities/bug-entity.js';

const FIRST_DELAY = 45;      // seconds before the first wave
const MIN_GAP = 70;          // seconds between waves...
const RAND_GAP = 20;         // ...plus randomness
const WAVE_SIZE = 10;
const DRIP_INTERVAL = 0.18;  // seconds between individual spawns in a wave
const BONUS_LIFETIME = [4.5, 6.5]; // bonus bugs leave quickly
const EDGE = 0.1;            // spawn margin (fraction of screen)
const HUD_SAFE_TOP = 90;

export class FrenzySpawner {
  constructor() {
    this.timer = FIRST_DELAY;
    this.pending = 0;
    this.dripTimer = 0;
    this.waveJustStarted = false;
  }

  /** Advance timers; returns a bonus BugEntity when one should appear. */
  update(dt, bounds) {
    if (this.pending > 0) {
      this.dripTimer -= dt;
      if (this.dripTimer > 0) return null;
      this.dripTimer = DRIP_INTERVAL;
      this.pending -= 1;
      return this.makeBonusFirefly(bounds);
    }

    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = MIN_GAP + Math.random() * RAND_GAP;
      this.pending = WAVE_SIZE;
      this.waveJustStarted = true;
    }
    return null;
  }

  /** One-shot flag so the game can show a banner when a wave begins. */
  consumeWaveStart() {
    const started = this.waveJustStarted;
    this.waveJustStarted = false;
    return started;
  }

  makeBonusFirefly(bounds) {
    const type = BUG_TYPES.firefly;
    const x = bounds.w * EDGE + Math.random() * bounds.w * (1 - EDGE * 2);
    const yTop = Math.max(bounds.h * EDGE, HUD_SAFE_TOP);
    const y = yTop + Math.random() * (bounds.h * (1 - EDGE) - yTop);

    const bug = new BugEntity(type, x, y, 0);
    const [minLife, maxLife] = BONUS_LIFETIME;
    bug.lifetime = minLife + Math.random() * (maxLife - minLife);
    bug.isBonus = true; // escape costs nothing
    return bug;
  }
}
