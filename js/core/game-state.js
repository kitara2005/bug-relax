// Pure game state: score, combo, level. No DOM/canvas — easy to test.

import { levelForScore, difficultyForLevel } from '../config/levels-config.js';
import { weaponForLevel } from '../config/weapons-config.js';
import { applySuperToTier, SUPER_DURATION } from '../config/super-weapons-config.js';

const COMBO_PER_MULT = 5; // every 5 combo → +1 multiplier
const MAX_MULT = 5;

export class GameState {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.level = 1;
    this.phase = 'start'; // 'start' | 'playing'
    this.superWeapon = null; // temporary weapon from a broken power-up orb
    this.superTimeLeft = 0;
  }

  get multiplier() {
    return Math.min(1 + Math.floor(this.combo / COMBO_PER_MULT), MAX_MULT);
  }

  get weapon() {
    return this.superWeapon ?? weaponForLevel(this.level);
  }

  /** Claim a super weapon for SUPER_DURATION seconds. */
  activateSuper(superDef) {
    this.superWeapon = applySuperToTier(superDef, weaponForLevel(this.level));
    this.superTimeLeft = SUPER_DURATION;
  }

  /** Tick timers; reports when the super weapon just expired. */
  update(dt) {
    if (this.superTimeLeft <= 0) return { superEnded: false };
    this.superTimeLeft -= dt;
    if (this.superTimeLeft > 0) return { superEnded: false };
    this.superTimeLeft = 0;
    this.superWeapon = null;
    return { superEnded: true };
  }

  get difficulty() {
    return difficultyForLevel(this.level);
  }

  start() {
    this.phase = 'playing';
  }

  /**
   * Register a bug kill. Returns gained points and whether the level went up.
   */
  registerKill(basePoints) {
    const gained = basePoints * this.multiplier;
    this.score += gained;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);

    const newLevel = levelForScore(this.score);
    const leveledUp = newLevel > this.level;
    this.level = newLevel;

    return { gained, leveledUp, level: this.level };
  }

  /** A bug escaped off screen — only penalty is losing the combo. */
  registerEscape() {
    const hadCombo = this.combo > 0;
    this.combo = 0;
    return { comboLost: hadCombo };
  }
}
