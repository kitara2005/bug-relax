// Weapon tiers — same tap mechanic, higher tiers hit harder and faster.
// cooldown in ms between shots; color drives beam/spark effects.

export const WEAPONS = [
  { name: 'Đèn Pin Nhỏ', icon: '🔦', damage: 1, cooldown: 400, color: '#ffd166' },
  { name: 'Vợt Tia Sáng', icon: '🏸', damage: 1, cooldown: 300, color: '#a8e6cf' },
  { name: 'Súng Sao Băng', icon: '☄️', damage: 2, cooldown: 300, color: '#8ecbff' },
  { name: 'Cung Trăng', icon: '🌙', damage: 2, cooldown: 240, color: '#c9b6ff' },
  { name: 'Laser Cực Quang', icon: '🌈', damage: 3, cooldown: 220, color: '#7dffd4' },
  { name: 'Pháo Tinh Vân', icon: '💫', damage: 4, cooldown: 200, color: '#ff9ad5' },
  { name: 'Lăng Kính Ngân Hà', icon: '🔮', damage: 5, cooldown: 180, color: '#b48aff' },
  { name: 'Vương Trượng Bình Minh', icon: '👑', damage: 6, cooldown: 160, color: '#ffe9a8' },
];

/** Weapon for a 1-based level (top tier repeats past the end). */
export function weaponForLevel(level) {
  return WEAPONS[Math.min(level - 1, WEAPONS.length - 1)];
}
