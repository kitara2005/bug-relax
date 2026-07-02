// Pre-rendered glow dots. shadowBlur is the most expensive Canvas 2D operation
// (CPU-side, scales with devicePixelRatio) — drawing a cached radial-gradient
// sprite with drawImage is ~10-50x cheaper, which matters when a kill burst
// spawns 20+ particles at once.

const cache = new Map(); // color → offscreen canvas
const SPRITE_SIZE = 64;

/**
 * A soft glowing dot: white-hot core fading through `color` to transparent.
 * Draw it with drawImage at ~4x the intended particle radius so the halo shows.
 */
export function getGlowSprite(color) {
  let sprite = cache.get(color);
  if (sprite) return sprite;

  sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext('2d');
  const c = SPRITE_SIZE / 2;

  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.2, color);
  g.addColorStop(0.55, color + '55'); // hex alpha — colors are #rrggbb
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  cache.set(color, sprite);
  return sprite;
}
