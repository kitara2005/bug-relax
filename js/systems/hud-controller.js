// DOM HUD: score / level / weapon / combo, level-up banner, start overlay, mute.

export class HudController {
  constructor() {
    this.el = {
      hud: document.getElementById('hud'),
      score: document.getElementById('hud-score'),
      level: document.getElementById('hud-level'),
      weapon: document.getElementById('hud-weapon'),
      combo: document.getElementById('hud-combo'),
      comboCount: document.getElementById('hud-combo-count'),
      comboMult: document.getElementById('hud-combo-mult'),
      lives: document.getElementById('hud-lives'),
      banner: document.getElementById('banner'),
      startOverlay: document.getElementById('start-overlay'),
      btnStart: document.getElementById('btn-start'),
      btnMute: document.getElementById('btn-mute'),
      gameoverOverlay: document.getElementById('gameover-overlay'),
      gameoverStats: document.getElementById('gameover-stats'),
      btnRestart: document.getElementById('btn-restart'),
    };
    this.bannerTimer = null;
  }

  onStart(callback) {
    this.el.btnStart.addEventListener('click', callback, { once: true });
  }

  onRestart(callback) {
    this.el.btnRestart.addEventListener('click', callback);
  }

  onMute(callback) {
    this.el.btnMute.addEventListener('click', () => {
      const muted = callback();
      this.el.btnMute.textContent = muted ? '🔇' : '🔊';
    });
  }

  hideStartOverlay() {
    this.el.startOverlay.classList.add('hidden');
    this.el.hud.classList.remove('hidden');
  }

  update(state) {
    this.el.score.textContent = state.score.toLocaleString('vi-VN');
    this.el.level.textContent = `Cấp ${state.level}`;
    this.el.lives.textContent = `🧡 ${state.lives}`;
    this.el.lives.classList.toggle('low', state.lives <= 10);

    // super weapon shows its countdown and a golden chip
    if (state.superTimeLeft > 0) {
      this.el.weapon.textContent =
        `${state.weapon.icon} ${state.weapon.name} · ${Math.ceil(state.superTimeLeft)}s`;
      this.el.weapon.classList.add('super');
    } else {
      this.el.weapon.textContent = `${state.weapon.icon} ${state.weapon.name}`;
      this.el.weapon.classList.remove('super');
    }

    if (state.combo >= 2) {
      this.el.combo.classList.remove('hidden');
      this.el.comboCount.textContent = state.combo;
      this.el.comboMult.textContent = `×${state.multiplier}`;
      // retrigger pop animation on change
      this.el.combo.style.animation = 'none';
      void this.el.combo.offsetWidth;
      this.el.combo.style.animation = '';
    } else {
      this.el.combo.classList.add('hidden');
    }
  }

  showLevelUpBanner(level, weapon) {
    this.showBanner(`✨ Cấp ${level} — ${weapon.icon} ${weapon.name}!`);
  }

  showGameOver(state) {
    this.el.gameoverStats.innerHTML =
      `Điểm: <strong>${state.score.toLocaleString('vi-VN')}</strong>` +
      ` · Cấp ${state.level} · Combo cao nhất ×${state.bestCombo}`;
    this.el.gameoverOverlay.classList.remove('hidden');
  }

  hideGameOver() {
    this.el.gameoverOverlay.classList.add('hidden');
  }

  showBanner(text) {
    const banner = this.el.banner;
    banner.textContent = text;
    banner.classList.remove('hidden');
    // restart the CSS animation
    banner.style.animation = 'none';
    void banner.offsetWidth;
    banner.style.animation = '';
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => banner.classList.add('hidden'), 2700);
  }
}
