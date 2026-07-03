// DOM HUD: score / level / weapon / combo, level-up banner, start overlay, mute.
// International UI: icons + numbers only, no words. Weapon/super icons use
// image assets when present (assets/images/weapon-N.png, super-<id>.png).

export class HudController {
  constructor(assets = null) {
    this.assets = assets;
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
      btnRelax: document.getElementById('btn-relax'),
      btnHome: document.getElementById('btn-home'),
      btnRain: document.getElementById('btn-rain'),
    };
    this.bannerTimer = null;
  }

  // mode buttons are re-armable (not once) so the player can return to the
  // menu and pick a different mode; they're only clickable while the overlay shows
  onStart(callback) {
    this.el.btnStart.addEventListener('click', callback);
  }

  onRelax(callback) {
    this.el.btnRelax.addEventListener('click', callback);
  }

  onHome(callback) {
    this.el.btnHome.addEventListener('click', callback);
  }

  onRain(callback) {
    this.el.btnRain.addEventListener('click', () => {
      const on = callback();
      this.setRainButton(on);
    });
  }

  /** Reflect rain on/off state on the button (dim when off). */
  setRainButton(on) {
    this.el.btnRain.classList.toggle('btn-off', !on);
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

  /** Back to the mode-selection screen (also clears any game-over overlay). */
  showStartOverlay() {
    this.el.gameoverOverlay.classList.add('hidden');
    this.el.startOverlay.classList.remove('hidden');
    this.el.hud.classList.add('hidden');
  }

  /** Weapon icon: image asset when available, emoji fallback. */
  weaponIconHTML(weapon) {
    const img = weapon.isSuper
      ? this.assets?.superIcons[weapon.superId]
      : this.assets?.weaponIcons[weapon.tier];
    return img ? `<img class="weapon-icon" src="${img.src}" alt="" />` : weapon.icon;
  }

  update(state) {
    this.el.score.textContent = state.score.toLocaleString('en-US');
    this.el.level.textContent = `Lv ${state.level}`;
    // relax mode: no lives to show
    this.el.lives.classList.toggle('hidden-relax', state.isRelax);
    this.el.lives.textContent = `🧡 ${state.lives}`;
    this.el.lives.classList.toggle('low', !state.isRelax && state.lives <= 5);

    // super weapon shows its countdown and a golden chip
    if (state.superTimeLeft > 0) {
      this.el.weapon.innerHTML =
        `${this.weaponIconHTML(state.weapon)} ${Math.ceil(state.superTimeLeft)}s`;
      this.el.weapon.classList.add('super');
    } else {
      this.el.weapon.innerHTML = this.weaponIconHTML(state.weapon);
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
    this.showBanner(`⭐ Lv ${level} · ${weapon.icon}`);
  }

  showGameOver(state) {
    this.el.gameoverStats.innerHTML =
      `⭐ <strong>${state.score.toLocaleString('en-US')}</strong>` +
      ` · Lv ${state.level} · 🔥 ×${state.bestCombo}`;
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
