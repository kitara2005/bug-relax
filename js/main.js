// Đêm Đom Đóm — bootstrap and game loop. Wires state, spawner, render, input, audio.

import { CanvasRenderer } from './render/canvas-renderer.js';
import { NightBackgroundPainter } from './render/night-background-painter.js';
import { drawBug } from './render/procedural-bug-painter.js';
import { GameState } from './core/game-state.js';
import { BugSpawner } from './core/bug-spawner.js';
import { PowerUpManager } from './core/power-up-manager.js';
import { FrenzySpawner } from './core/frenzy-spawner.js';
import { shoot } from './core/combat-controller.js';
import { ParticleSystem } from './entities/particle-system.js';
import { FloatingTextSystem } from './entities/floating-text.js';
import { PointerInput } from './systems/pointer-input.js';
import { AudioManager } from './systems/audio-manager.js';
import { AssetLoader } from './systems/asset-loader.js';
import { HudController } from './systems/hud-controller.js';

class Game {
  constructor(assets) {
    this.assets = assets;
    this.renderer = new CanvasRenderer(document.getElementById('game-canvas'));
    this.background = new NightBackgroundPainter(assets.background);
    this.state = new GameState();
    this.spawner = new BugSpawner();
    this.powerUps = new PowerUpManager();
    this.frenzy = new FrenzySpawner();
    this.lastSuperSec = 0; // last countdown second shown on the HUD
    this.particles = new ParticleSystem();
    this.texts = new FloatingTextSystem();
    this.audio = new AudioManager();
    this.hud = new HudController(assets);

    this.bugs = [];
    this.lastShotAt = 0;
    this.lastFrame = performance.now();
    this.elapsed = 0;

    this.renderer.onResize = (w, h) => this.background.layout(w, h);
    this.background.layout(this.renderer.w, this.renderer.h);

    this.input = new PointerInput(this.renderer.canvas, {
      onShoot: (x, y) => shoot(this, x, y),
    });

    this.hud.onStart(() => this.start('game'));
    this.hud.onRelax(() => this.start('relax'));
    this.hud.onRestart(() => this.restart());
    this.hud.onHome(() => this.returnToMenu());
    this.hud.onMute(() => this.audio.toggleMute());

    // pause simulation when the tab is hidden (rAF stops; clamp dt on return)
    document.addEventListener('visibilitychange', () => {
      this.lastFrame = performance.now();
    });

    requestAnimationFrame((t) => this.frame(t));
  }

  start(mode = 'game') {
    this.audio.unlock();
    this.state.start(mode);
    this.hud.hideStartOverlay();
    this.hud.update(this.state);
    if (mode === 'relax') this.audio.startRelaxPlaylist(); // continuous listening
    else this.audio.setMusicForLevel(this.state.level);
  }

  /** Out of lives: play stops (update loop freezes), show the summary. */
  endRun() {
    this.input.down = false; // drop any held auto-fire so restart starts clean
    this.audio.playGameOver();
    this.hud.showGameOver(this.state);
  }

  /** Menu (☰): pause, clear the field and return to mode selection. */
  returnToMenu() {
    this.state.phase = 'start'; // freezes the update loop
    this.audio.stopMusic();
    this.bugs = [];
    this.spawner = new BugSpawner();
    this.powerUps = new PowerUpManager();
    this.frenzy = new FrenzySpawner();
    this.particles = new ParticleSystem();
    this.texts = new FloatingTextSystem();
    this.input.down = false;
    this.hud.showStartOverlay();
  }

  /** "Chơi lại": wipe the field and begin a fresh run. */
  restart() {
    this.state.resetRun();
    this.bugs = [];
    this.spawner = new BugSpawner();
    this.powerUps = new PowerUpManager();
    this.frenzy = new FrenzySpawner();
    this.particles = new ParticleSystem();
    this.texts = new FloatingTextSystem();
    this.lastSuperSec = 0;
    this.input.down = false; // never carry a held pointer into the new run
    this.hud.hideGameOver();
    this.hud.update(this.state);
    this.audio.setMusicForLevel(this.state.level);
  }

  update(dt) {
    if (this.state.phase !== 'playing') return;

    const difficulty = this.state.difficulty;
    const bounds = this.renderer.bounds;

    // super-weapon timer: expire + per-second HUD countdown
    if (this.state.update(dt).superEnded) this.hud.update(this.state);
    if (this.state.superTimeLeft > 0) {
      const sec = Math.ceil(this.state.superTimeLeft);
      if (sec !== this.lastSuperSec) {
        this.lastSuperSec = sec;
        this.hud.update(this.state);
      }
    }

    // hold-to-sweep: keep firing at the held pointer (cooldown gates the rate)
    if (this.input.down && this.input.x != null) shoot(this, this.input.x, this.input.y);

    this.powerUps.update(dt, this.state.level, bounds);

    const newBug = this.spawner.update(dt * 1000, difficulty, this.state.level, this.bugs.length, bounds, this.state.isRelax);
    if (newBug) this.bugs.push(newBug);

    // frenzy wave: bonus fireflies, free to miss
    const bonusBug = this.frenzy.update(dt, bounds);
    if (bonusBug) this.bugs.push(bonusBug);
    if (this.frenzy.consumeWaveStart()) {
      this.hud.showBanner('✨ 🐛🐛🐛 ✨');
      this.audio.playPowerUp();
    }

    let escapedAny = false;
    let outOfLives = false;
    for (const bug of this.bugs) {
      bug.update(dt, difficulty.speedMult, bounds);
      if (bug.escaped) {
        bug.escaped = false; // handle once
        if (bug.isBonus) continue;         // frenzy bugs escape for free
        if (this.state.isRelax) continue;  // relax: bugs just drift away, no penalty
        if (this.state.phase === 'gameover') continue; // already dead, don't over-count
        escapedAny = true;
        // show the life loss where the bug left (clamped back into view)
        const tx = Math.min(Math.max(bug.x, 40), bounds.w - 40);
        const ty = Math.min(Math.max(bug.y, 90), bounds.h - 40);
        this.texts.add('-1 🧡', tx, ty, '#ff9d9d', 17);
        if (this.state.registerEscape().gameOver) outOfLives = true;
      }
    }
    this.bugs = this.bugs.filter((b) => b.state !== 'gone');

    if (escapedAny) {
      this.audio.playEscape();
      this.hud.update(this.state);
    }
    if (outOfLives) this.endRun();

    this.particles.update(dt);
    this.texts.update(dt);
  }

  render() {
    const { ctx, w, h } = this.renderer;
    this.renderer.clear();
    this.background.draw(ctx, w, h, this.elapsed);

    for (const bug of this.bugs) {
      drawBug(ctx, bug, this.elapsed, this.assets.bugSprites[bug.type.id]);
    }

    this.powerUps.draw(ctx, this.elapsed, this.assets);
    this.particles.draw(ctx);
    this.texts.draw(ctx);

    if (this.state.phase === 'playing') {
      this.renderer.drawCursor(this.input.x, this.input.y, this.state.weapon.color);
    }
  }

  frame(now) {
    // hard pause while the tab/app is in the background: some browsers keep
    // firing rAF at a reduced rate, which would let bugs escape unseen and
    // silently drain lives
    if (document.hidden) {
      this.lastFrame = now;
      requestAnimationFrame((t) => this.frame(t));
      return;
    }

    const dt = Math.min((now - this.lastFrame) / 1000, 0.05); // clamp long gaps
    this.lastFrame = now;
    this.elapsed += dt;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.frame(t));
  }
}

// boot: try loading optional assets, then start the loop (start screen shows first)
// window.game exposed for debugging/testing in console
new AssetLoader().load().then((assets) => {
  window.game = new Game(assets);
});
