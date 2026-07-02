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
      banner: document.getElementById('banner'),
      startOverlay: document.getElementById('start-overlay'),
      btnStart: document.getElementById('btn-start'),
      btnMute: document.getElementById('btn-mute'),
    };
    this.bannerTimer = null;
  }

  onStart(callback) {
    this.el.btnStart.addEventListener('click', callback, { once: true });
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
    this.el.weapon.textContent = `${state.weapon.icon} ${state.weapon.name}`;

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
    const banner = this.el.banner;
    banner.textContent = `✨ Cấp ${level} — ${weapon.icon} ${weapon.name}!`;
    banner.classList.remove('hidden');
    // restart the CSS animation
    banner.style.animation = 'none';
    void banner.offsetWidth;
    banner.style.animation = '';
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => banner.classList.add('hidden'), 2700);
  }
}
