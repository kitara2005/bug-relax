// Temporary super weapons dropped by power-up orbs. Player must break the orb
// (shoot it) to claim one; the effect lasts SUPER_DURATION seconds, then the
// weapon reverts to the current level tier.

export const SUPER_DURATION = 15; // seconds

export const SUPER_WEAPONS = [
  {
    id: 'storm',
    name: 'Bão Sao Băng',
    icon: '⚡',
    mode: 'damage', // triple damage single-target
    damageMult: 3,
    color: '#ffe066',
  },
  {
    id: 'nova',
    name: 'Pháo Hoa Nova',
    icon: '🎆',
    mode: 'splash', // every bug near the tap point takes the hit
    splashRadius: 130,
    color: '#ff9ad5',
  },
  {
    id: 'zephyr',
    name: 'Gió Thần Tốc',
    icon: '🌪️',
    mode: 'rapid', // near-instant cooldown between shots
    cooldown: 70,
    color: '#7dffd4',
  },
];

export function randomSuperWeapon() {
  return SUPER_WEAPONS[Math.floor(Math.random() * SUPER_WEAPONS.length)];
}

/** Merge a super weapon onto the player's current tier weapon stats. */
export function applySuperToTier(superDef, tierWeapon) {
  const weapon = {
    ...tierWeapon,
    name: superDef.name,
    icon: superDef.icon,
    color: superDef.color,
    isSuper: true,
    superId: superDef.id, // for icon asset lookup (assets/images/super-<id>.png)
  };
  if (superDef.mode === 'damage') weapon.damage = tierWeapon.damage * superDef.damageMult;
  if (superDef.mode === 'rapid') weapon.cooldown = superDef.cooldown;
  if (superDef.mode === 'splash') weapon.splashRadius = superDef.splashRadius;
  return weapon;
}
