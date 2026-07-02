// Spawns bugs on a timer whose rate/caps come from the current difficulty.

import { pickBugType } from '../config/bug-types-config.js';
import { BugEntity } from '../entities/bug-entity.js';

const EDGE_MARGIN = 0.08;  // keep spawns away from screen edges (fraction of size)
const HUD_SAFE_TOP = 80;   // don't spawn under the HUD bar
const JITTER = 0.3;        // ±30% randomness on spawn interval

export class BugSpawner {
  constructor() {
    this.timerMs = 800; // first bug appears quickly after start
  }

  /**
   * Advance the spawn timer; returns a new BugEntity when one should appear.
   * @param {number} dtMs elapsed ms
   * @param {{spawnIntervalMs:number, maxBugs:number, hpBonus:number}} difficulty
   * @param {number} level current level
   * @param {number} activeBugs bugs currently on screen
   * @param {{w:number, h:number}} bounds canvas size in CSS px
   */
  update(dtMs, difficulty, level, activeBugs, bounds) {
    this.timerMs -= dtMs;
    if (this.timerMs > 0) return null;

    // reset timer with jitter so spawns feel organic, not metronomic
    const base = difficulty.spawnIntervalMs;
    this.timerMs = base * (1 + (Math.random() * 2 - 1) * JITTER);

    if (activeBugs >= difficulty.maxBugs) return null;

    const type = pickBugType(level);
    const mx = bounds.w * EDGE_MARGIN + type.size / 2;
    const myTop = Math.max(bounds.h * EDGE_MARGIN, HUD_SAFE_TOP) + type.size / 2;
    const myBottom = bounds.h * (1 - EDGE_MARGIN) - type.size / 2;

    const x = mx + Math.random() * (bounds.w - mx * 2);
    const y = myTop + Math.random() * Math.max(myBottom - myTop, 1);

    return new BugEntity(type, x, y, difficulty.hpBonus);
  }
}
