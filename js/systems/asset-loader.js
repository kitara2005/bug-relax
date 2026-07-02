// Optional-asset loader. The game is fully playable with zero files:
// every image that fails to load simply stays procedural.

import { BUG_TYPES } from '../config/bug-types-config.js';
import { WEAPONS } from '../config/weapons-config.js';
import { SUPER_WEAPONS } from '../config/super-weapons-config.js';

const IMAGE_DIR = 'assets/images/';

function tryLoadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // missing file → procedural fallback
    img.src = src;
  });
}

/**
 * Downscale a sprite once to its max on-screen size (×2 for retina).
 * Resampling a 512px PNG on every drawImage call is wasted work per frame.
 */
function prescaleSprite(img, displaySize) {
  if (!img) return null;
  const px = Math.round(displaySize * 1.1 * 2);
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  canvas.getContext('2d').drawImage(img, 0, 0, px, px);
  return canvas;
}

export class AssetLoader {
  constructor() {
    this.background = null;      // HTMLImageElement | null
    this.bugSprites = {};        // typeId → canvas | null
    this.weaponIcons = {};       // tier (1-8) → HTMLImageElement | null
    this.superIcons = {};        // super id → HTMLImageElement | null
  }

  async load() {
    const bugIds = Object.keys(BUG_TYPES);
    const superIds = SUPER_WEAPONS.map((s) => s.id);
    const [background, bugs, weapons, supers] = await Promise.all([
      tryLoadImage(`${IMAGE_DIR}background.png`),
      Promise.all(bugIds.map((id) => tryLoadImage(`${IMAGE_DIR}bug-${id}.png`))),
      Promise.all(WEAPONS.map((w) => tryLoadImage(`${IMAGE_DIR}weapon-${w.tier}.png`))),
      Promise.all(superIds.map((id) => tryLoadImage(`${IMAGE_DIR}super-${id}.png`))),
    ]);
    this.background = background;
    bugIds.forEach((id, i) => {
      this.bugSprites[id] = prescaleSprite(bugs[i], BUG_TYPES[id].size);
    });
    WEAPONS.forEach((w, i) => {
      this.weaponIcons[w.tier] = weapons[i];
    });
    superIds.forEach((id, i) => {
      this.superIcons[id] = supers[i];
    });
    return this;
  }
}
