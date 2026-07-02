// Weapon tiers — same tap mechanic, higher tiers hit harder and faster.
// cooldown in ms between shots; color drives beam/spark effects.
// Tiers 5-8 gain a small built-in splash so dense late-game screens don't
// demand one precise tap per bug (anti-fatigue). Names are internal only —
// the HUD is icon + numbers (international, no text).
// `tier` maps to the optional icon asset assets/images/weapon-<tier>.png.

export const WEAPONS = [
  { tier: 1, name: 'Tiny Torch', icon: '🔦', damage: 1, cooldown: 400, color: '#ffd166' },
  { tier: 2, name: 'Light Racket', icon: '🏸', damage: 1, cooldown: 300, color: '#a8e6cf' },
  { tier: 3, name: 'Meteor Gun', icon: '☄️', damage: 2, cooldown: 300, color: '#8ecbff' },
  { tier: 4, name: 'Moon Bow', icon: '🌙', damage: 2, cooldown: 240, color: '#c9b6ff' },
  { tier: 5, name: 'Aurora Laser', icon: '🌈', damage: 3, cooldown: 220, color: '#7dffd4', splashRadius: 40 },
  { tier: 6, name: 'Nebula Cannon', icon: '💫', damage: 4, cooldown: 200, color: '#ff9ad5', splashRadius: 50 },
  { tier: 7, name: 'Galaxy Prism', icon: '🔮', damage: 5, cooldown: 180, color: '#b48aff', splashRadius: 60 },
  { tier: 8, name: 'Dawn Scepter', icon: '👑', damage: 6, cooldown: 160, color: '#ffe9a8', splashRadius: 70 },
];

/** Weapon for a 1-based level (top tier repeats past the end). */
export function weaponForLevel(level) {
  return WEAPONS[Math.min(level - 1, WEAPONS.length - 1)];
}
