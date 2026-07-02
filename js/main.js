// Đêm Đom Đóm — bootstrap and game loop. Wires state, spawner, render, input, audio.

import { CanvasRenderer } from './render/canvas-renderer.js';
import { NightBackgroundPainter } from './render/night-background-painter.js';
import { drawBug } from './render/procedural-bug-painter.js';
import { GameState } from './core/game-state.js';
import { BugSpawner } from './core/bug-spawner.js';
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
      onShoot: (x, y) => this.shoot(x, y),
    });

    this.hud.onStart(() => this.start());
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

  shoot(x, y) {
    if (this.state.phase !== 'playing') return;

    const now = performance.now();
    const weapon = this.state.weapon;
    if (now - this.lastShotAt < weapon.cooldown) return; // weapon still recharging
    this.lastShotAt = now;

    this.audio.playShoot();

    // hit the topmost (last spawned) bug under the tap
    const target = [...this.bugs].reverse().find((b) => b.state !== 'gone' && b.containsPoint(x, y));
    if (!target) {
      this.particles.spawnMissRipple(x, y, weapon.color);
      return;
    }

    this.particles.spawnHitSparks(x, y, weapon.color);
    const died = target.takeDamage(weapon.damage);
    if (!died) {
      this.audio.playHit();
      return;
    }

    // kill: burst, points, combo, possible level-up
    this.particles.spawnKillBurst(target.x, target.y, target.type.glow, target.type.size);
    const result = this.state.registerKill(target.type.points);
    this.texts.add(
      `+${result.gained}${this.state.multiplier > 1 ? ` ×${this.state.multiplier}` : ''}`,
      target.x, target.y - target.type.size * 0.5, target.type.glow,
    );
    this.audio.playKill();

    if (result.leveledUp) {
      this.hud.showLevelUpBanner(result.level, this.state.weapon);
      this.particles.spawnLevelConfetti(this.renderer.w, this.state.weapon.color);
      this.audio.playLevelUp();
      this.audio.setMusicForLevel(result.level);
    }
    this.hud.update(this.state);
  }

  update(dt) {
    if (this.state.phase !== 'playing') return;

    const difficulty = this.state.difficulty;
    const bounds = this.renderer.bounds;

    const newBug = this.spawner.update(dt * 1000, difficulty, this.state.level, this.bugs.length, bounds);
    if (newBug) this.bugs.push(newBug);

    let comboLost = false;
    for (const bug of this.bugs) {
      bug.update(dt, difficulty.speedMult, bounds);
      if (bug.escaped) {
        bug.escaped = false; // handle once
        const { comboLost: lost } = this.state.registerEscape();
        comboLost = comboLost || lost;
      }
    }
    this.bugs = this.bugs.filter((b) => b.state !== 'gone');

    if (comboLost) {
      this.audio.playEscape();
      this.hud.update(this.state);
    }

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
