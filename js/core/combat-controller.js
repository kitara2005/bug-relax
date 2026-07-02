// Combat resolution: what happens when the player taps. Kept out of main.js —
// operates on the Game instance (state, bugs, particles, texts, audio, hud, powerUps).

/** Player tapped at (x, y). */
export function shoot(game, x, y) {
  if (game.state.phase !== 'playing') return;

  const now = performance.now();
  const weapon = game.state.weapon;
  if (now - game.lastShotAt < weapon.cooldown) return; // weapon still recharging
  game.lastShotAt = now;

  game.audio.playShoot();

  // power-up orb takes priority — break it to claim a super weapon
  const orbHit = game.powerUps.tryHit(x, y);
  if (orbHit) {
    game.particles.spawnHitSparks(orbHit.x, orbHit.y, orbHit.color, 10);
    if (orbHit.broken) claimSuperWeapon(game, orbHit);
    else game.audio.playHit();
    return;
  }

  // splash weapons hit every bug near the tap; others hit the topmost one
  const targets = weapon.splashRadius
    ? game.bugs.filter((b) => b.state !== 'gone' && Math.hypot(b.x - x, b.y - y) <= weapon.splashRadius)
    : [[...game.bugs].reverse().find((b) => b.state !== 'gone' && b.containsPoint(x, y))].filter(Boolean);

  if (!targets.length) {
    game.particles.spawnMissRipple(x, y, weapon.color);
    return;
  }

  game.particles.spawnHitSparks(x, y, weapon.color);
  if (weapon.splashRadius) game.particles.spawnMissRipple(x, y, weapon.color, weapon.splashRadius);

  let killed = 0;
  for (const target of targets) {
    if (target.takeDamage(weapon.damage)) {
      killed++;
      handleKill(game, target);
    }
  }
  if (!killed) game.audio.playHit();
}

/** Bug died: burst, points, combo, possible level-up. */
function handleKill(game, target) {
  game.particles.spawnKillBurst(target.x, target.y, target.type.glow, target.type.size);
  const result = game.state.registerKill(target.type.points);
  game.texts.add(
    `+${result.gained}${game.state.multiplier > 1 ? ` ×${game.state.multiplier}` : ''}`,
    target.x, target.y - target.type.size * 0.5, target.type.glow,
  );
  game.audio.playKill();

  // combo milestone paid out a life
  if (result.lifeGained) {
    game.texts.add('+1 🧡', target.x, target.y - target.type.size, '#8dffb0', 20);
    game.audio.playPowerUp();
  }

  if (result.leveledUp) {
    game.hud.showLevelUpBanner(result.level, game.state.weapon);
    game.particles.spawnLevelConfetti(game.renderer.w, game.state.weapon.color);
    game.audio.playLevelUp();
    game.audio.setMusicForLevel(result.level);
  }
  game.hud.update(game.state);
}

/** Orb broken: activate the 15s super weapon with fanfare. */
function claimSuperWeapon(game, { superDef, x, y, color }) {
  game.state.activateSuper(superDef);
  game.lastSuperSec = 0;
  game.particles.spawnKillBurst(x, y, color, 76);
  game.audio.playPowerUp();
  game.hud.showBanner(`${superDef.icon} 15s`);
  game.hud.update(game.state);
}
