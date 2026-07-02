// Pure game state: score, combo, level. No DOM/canvas — easy to test.

import { levelForScore, difficultyForLevel } from '../config/levels-config.js';
import { weaponForLevel } from '../config/weapons-config.js';
import { applySuperToTier, SUPER_DURATION } from '../config/super-weapons-config.js';

const COMBO_PER_MULT = 5; // every 5 combo → +1 multiplier
const MAX_MULT = 5;
const STARTING_LIVES = 15; // one life lost per escaped bug; 0 → game over
const COMBO_PER_LIFE = 15; // every 15 combo → +1 life back (capped at start value)

export class GameState {
  constructor() {
    this.resetRun();
    this.phase = 'start'; // 'start' | 'playing' | 'gameover'
  }

  /** Fresh run: everything back to square one (used on start and restart). */
  resetRun() {
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.level = 1;
    this.lives = STARTING_LIVES;
    this.superWeapon = null; // temporary weapon from a broken power-up orb
    this.superTimeLeft = 0;
    this.phase = 'playing';
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
    this.resetRun();
  }

  /**
   * Register a bug kill. Returns gained points and whether the level went up.
   */
  registerKill(basePoints) {
    const gained = basePoints * this.multiplier;
    this.score += gained;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);

    // combo milestone gives a life back — comeback mechanic, makes combo matter
    let lifeGained = false;
    if (this.combo % COMBO_PER_LIFE === 0 && this.lives < STARTING_LIVES) {
      this.lives += 1;
      lifeGained = true;
    }

    const newLevel = levelForScore(this.score);
    const leveledUp = newLevel > this.level;
    this.level = newLevel;

    return { gained, leveledUp, level: this.level, lifeGained };
  }

  /** A bug escaped off screen: combo resets and one life is lost. */
  registerEscape() {
    const hadCombo = this.combo > 0;
    this.combo = 0;
    this.lives = Math.max(this.lives - 1, 0);
    const gameOver = this.lives === 0;
    if (gameOver) this.phase = 'gameover';
    return { comboLost: hadCombo, lives: this.lives, gameOver };
  }
}
