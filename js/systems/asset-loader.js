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
      this.bugSprites[id] = sprites[i];
    });
    return this;
  }
}
