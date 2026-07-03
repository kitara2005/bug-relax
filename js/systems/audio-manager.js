// Audio: procedural WebAudio SFX + optional Suno music tracks.
// Music files live at assets/music/track-1..5.mp3 — silent when missing.

import { musicTrackForLevel } from '../config/levels-config.js';

const TRACK_COUNT = 5;
const MUSIC_VOLUME = 0.45;
const FADE_STEP = 0.03; // per 60ms tick → ~1s crossfade
const RAIN_VOLUME = 0.13; // gentle rain layer, sits under the music

export class AudioManager {
  constructor() {
    this.ctx = null;          // lazy — created on first user gesture
    this.muted = false;
    this.tracks = [];         // HTMLAudioElement | null per track
    this.currentTrack = -1;
    this.fadeInterval = null; // active crossfade timer (only one at a time)
    this.relaxPlaylist = false; // relax mode chains all tracks continuously
    this.rainOn = false;      // gentle rain ambience toggle
    this.rainNodes = null;    // active rain audio graph
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
      // relax playlist: when a track finishes, roll to the next available one
      audio.addEventListener('ended', () => {
        if (this.relaxPlaylist) this.playRelaxFrom(slot + 1);
      });
    }
  }

  /** Stop all music (used when returning to the menu). */
  stopMusic() {
    this.relaxPlaylist = false;
    if (this.fadeInterval) { clearInterval(this.fadeInterval); this.fadeInterval = null; }
    this.tracks.forEach((t) => { if (t) { t.pause(); t.loop = true; } });
    this.currentTrack = -1;
  }

  /** Relax mode: play all tracks back-to-back on a loop for continuous listening. */
  startRelaxPlaylist() {
    this.relaxPlaylist = true;
    this.tracks.forEach((t) => { if (t) t.loop = false; }); // chain, don't loop one
    this.playRelaxFrom(0);
  }

  /** Play the first available track at/after startIdx, wrapping around. */
  playRelaxFrom(startIdx) {
    for (let k = 0; k < TRACK_COUNT; k++) {
      const idx = (startIdx + k) % TRACK_COUNT;
      const t = this.tracks[idx];
      if (t) {
        this.currentTrack = idx;
        t.currentTime = 0;
        t.volume = this.muted ? 0 : MUSIC_VOLUME;
        t.play().catch(() => {});
        return;
      }
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
    // rain follows mute too
    if (this.rainNodes) this.rainNodes.master.gain.value = this.muted ? 0 : 1;
    return this.muted;
  }

  /** Toggle a gentle procedural rain layer (filtered looping noise). */
  toggleRain() {
    this.unlock();
    if (!this.ctx) return false;
    if (this.rainOn) {
      this.stopRain();
    } else {
      this.startRain();
    }
    return this.rainOn;
  }

  startRain() {
    const ctx = this.ctx;
    // ~2s of white noise, looped — the raw "hiss"
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // shape the noise into soft rain: cut rumble + tame the harsh highs
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 400;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1500;

    // inner gain modulated slowly so intensity gently swells like real rain
    const inner = ctx.createGain();
    inner.gain.value = RAIN_VOLUME;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = RAIN_VOLUME * 0.3;
    lfo.connect(lfoGain).connect(inner.gain);

    // master gain: mute control point
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 1;

    src.connect(hp).connect(lp).connect(inner).connect(master).connect(ctx.destination);
    src.start();
    lfo.start();

    this.rainNodes = { src, lfo, master };
    this.rainOn = true;
  }

  stopRain() {
    if (this.rainNodes) {
      try { this.rainNodes.src.stop(); this.rainNodes.lfo.stop(); } catch { /* already stopped */ }
      this.rainNodes = null;
    }
    this.rainOn = false;
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
