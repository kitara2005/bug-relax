// Optional-asset loader. The game is fully playable with zero files:
// every image that fails to load simply stays procedural.

import { BUG_TYPES } from '../config/bug-types-config.js';

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
    this.bugSprites = {};        // typeId → HTMLImageElement | null
  }

  async load() {
    const bugIds = Object.keys(BUG_TYPES);
    const [background, ...sprites] = await Promise.all([
      tryLoadImage(`${IMAGE_DIR}background.png`),
      ...bugIds.map((id) => tryLoadImage(`${IMAGE_DIR}bug-${id}.png`)),
    ]);
    this.background = background;
    bugIds.forEach((id, i) => {
      this.bugSprites[id] = prescaleSprite(sprites[i], BUG_TYPES[id].size);
    });
    return this;
  }
}
