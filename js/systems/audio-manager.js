// Audio: procedural WebAudio SFX + optional Suno music tracks.
// Music files live at assets/music/track-1..5.mp3 — silent when missing.

import { musicTrackForLevel } from '../config/levels-config.js';

const TRACK_COUNT = 5;
const MUSIC_VOLUME = 0.45;
const FADE_STEP = 0.03; // per 60ms tick → ~1s crossfade

export class AudioManager {
  constructor() {
    this.ctx = null;          // lazy — created on first user gesture
    this.muted = false;
    this.tracks = [];         // HTMLAudioElement | null per track
    this.currentTrack = -1;
    this.fadeInterval = null; // active crossfade timer (only one at a time)
    this.prepareTracks();
  }

  prepareTracks() {
    for (let i = 1; i <= TRACK_COUNT; i++) {
      const audio = new Audio(`assets/music/track-${i}.mp3`);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = 'auto';
      const slot = i - 1;
      this.tracks[slot] = audio;
      audio.addEventListener('error', () => {
        this.tracks[slot] = null; // file missing → stay silent
      });
    }
  }

  /** Must be called from a user gesture (autoplay policy). */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    const current = this.tracks[this.currentTrack];
    if (current) current.volume = this.muted ? 0 : MUSIC_VOLUME;
    return this.muted;
  }

  /** Switch music to the track mapped to this level, crossfading. */
  setMusicForLevel(level) {
    const target = musicTrackForLevel(level) - 1;
    if (target === this.currentTrack) return;
    const from = this.tracks[this.currentTrack];
    const to = this.tracks[target];
    this.currentTrack = target;
    if (to && !this.muted) {
      to.currentTime = 0;
      to.play().catch(() => {}); // ignore autoplay rejections
    }
    // simple linear crossfade — cancel any in-flight fade so overlapping
    // level-ups don't spawn rival intervals fighting over the same volumes
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeInterval = setInterval(() => {
      let done = true;
      if (from && from.volume > 0) {
        from.volume = Math.max(from.volume - FADE_STEP, 0);
        if (from.volume === 0) from.pause();
        else done = false;
      }
      if (to && !this.muted && to.volume < MUSIC_VOLUME) {
        to.volume = Math.min(to.volume + FADE_STEP, MUSIC_VOLUME);
        if (to.volume < MUSIC_VOLUME) done = false;
      }
      if (done) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 60);
  }

  // ---- procedural SFX (short, soft, no files needed) ----

  /** One oscillator note with quick attack and exponential decay. */
  note(freq, { type = 'sine', duration = 0.15, volume = 0.18, delay = 0 } = {}) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  playShoot() {
    this.note(520, { type: 'triangle', duration: 0.09, volume: 0.1 });
  }

  playHit() {
    this.note(860, { type: 'sine', duration: 0.06, volume: 0.12 });
  }

  playKill() {
    this.note(523, { type: 'triangle', duration: 0.22, volume: 0.16 });
    this.note(784, { type: 'triangle', duration: 0.3, volume: 0.14, delay: 0.07 });
  }

  playEscape() {
    this.note(196, { type: 'sine', duration: 0.35, volume: 0.07 });
  }

  playGameOver() {
    [392, 330, 262].forEach((f, i) =>
      this.note(f, { type: 'sine', duration: 0.4, volume: 0.12, delay: i * 0.18 }),
    );
  }

  playPowerUp() {
    [659, 880, 1175].forEach((f, i) =>
      this.note(f, { type: 'triangle', duration: 0.22, volume: 0.15, delay: i * 0.06 }),
    );
  }

  playLevelUp() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.note(f, { type: 'triangle', duration: 0.28, volume: 0.14, delay: i * 0.09 }),
    );
  }
}
