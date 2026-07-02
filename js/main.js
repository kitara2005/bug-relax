// Đêm Đom Đóm — bootstrap and game loop. Wires state, spawner, render, input, audio.

import { CanvasRenderer } from './render/canvas-renderer.js';
import { NightBackgroundPainter } from './render/night-background-painter.js';
import { drawBug } from './render/procedural-bug-painter.js';
import { GameState } from './core/game-state.js';
import { BugSpawner } from './core/bug-spawner.js';
import { PowerUpManager } from './core/power-up-manager.js';
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
    this.lastSuperSec = 0; // last countdown second shown on the HUD
    this.particles = new ParticleSystem();
    this.texts = new FloatingTextSystem();
    this.audio = new AudioManager();
    this.hud = new HudController();

    this.bugs = [];
    this.lastShotAt = 0;
    this.lastFrame = performance.now();
    this.elapsed = 0;

    this.renderer.onResize = (w, h) => this.background.layout(w, h);
    this.background.layout(this.renderer.w, this.renderer.h);

    this.input = new PointerInput(this.renderer.canvas, {
      onShoot: (x, y) => shoot(this, x, y),
    });

    this.hud.onStart(() => this.start());
    this.hud.onRestart(() => this.restart());
    this.hud.onMute(() => this.audio.toggleMute());

    // pause simulation when the tab is hidden (rAF stops; clamp dt on return)
    document.addEventListener('visibilitychange', () => {
      this.lastFrame = performance.now();
    });

    requestAnimationFrame((t) => this.frame(t));
  }

  start() {
    this.audio.unlock();
    this.state.start();
    this.hud.hideStartOverlay();
    this.hud.update(this.state);
    this.audio.setMusicForLevel(this.state.level);
  }

  /** Out of lives: play stops (update loop freezes), show the summary. */
  endRun() {
    this.audio.playGameOver();
    this.hud.showGameOver(this.state);
  }

  /** "Chơi lại": wipe the field and begin a fresh run. */
  restart() {
    this.state.resetRun();
    this.bugs = [];
    this.spawner = new BugSpawner();
    this.powerUps = new PowerUpManager();
    this.particles = new ParticleSystem();
    this.texts = new FloatingTextSystem();
    this.lastSuperSec = 0;
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

    this.powerUps.update(dt, this.state.level, bounds);

    const newBug = this.spawner.update(dt * 1000, difficulty, this.state.level, this.bugs.length, bounds);
    if (newBug) this.bugs.push(newBug);

    let escapedAny = false;
    let outOfLives = false;
    for (const bug of this.bugs) {
      bug.update(dt, difficulty.speedMult, bounds);
      if (bug.escaped) {
        bug.escaped = false; // handle once
        escapedAny = true;
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

    this.powerUps.draw(ctx, this.elapsed);
    this.particles.draw(ctx);
    this.texts.draw(ctx);

    if (this.state.phase === 'playing') {
      this.renderer.drawCursor(this.input.x, this.input.y, this.state.weapon.color);
    }
  }

  frame(now) {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05); // clamp long gaps (tab switch)
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
