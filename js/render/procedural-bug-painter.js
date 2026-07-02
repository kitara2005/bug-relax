// Draws glowing kawaii bugs procedurally (top-down, head up). When a real
// sprite PNG is loaded it is used instead, keeping the same glow aura.

import { getGlowSprite } from './glow-sprite-cache.js';

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function bodyGradient(ctx, r, inner, outer) {
  const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  return g;
}

/** Two cute eyes with sparkles, placed on the head. */
function eyes(ctx, y, spacing, r) {
  ellipse(ctx, -spacing, y, r, r, '#ffffff');
  ellipse(ctx, spacing, y, r, r, '#ffffff');
  ellipse(ctx, -spacing, y, r * 0.55, r * 0.55, '#1a1a2e');
  ellipse(ctx, spacing, y, r * 0.55, r * 0.55, '#1a1a2e');
  ellipse(ctx, -spacing + r * 0.2, y - r * 0.25, r * 0.18, r * 0.18, '#ffffff');
  ellipse(ctx, spacing + r * 0.2, y - r * 0.25, r * 0.18, r * 0.18, '#ffffff');
}

/** A pair of wings, mirrored, flapping via scaleX. `flap` in 0..1. */
function wingPair(ctx, y, rx, ry, tilt, flap, color) {
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * rx * 0.35, y);
    ctx.rotate(side * tilt);
    ctx.scale(0.55 + flap * 0.45, 1);
    ellipse(ctx, side * rx * 0.55, 0, rx, ry, color);
    ctx.restore();
  }
}

// ---- per-type painters: draw centered at (0,0), size s = diameter ----

const PAINTERS = {
  firefly(ctx, s, type, t) {
    const flap = 0.5 + 0.5 * Math.sin(t * 16);
    wingPair(ctx, -s * 0.12, s * 0.3, s * 0.14, -0.5, flap, 'rgba(220,240,255,0.45)');
    ellipse(ctx, 0, -s * 0.22, s * 0.17, s * 0.15, type.body);        // head
    ellipse(ctx, 0, -s * 0.02, s * 0.15, s * 0.14, type.body);        // thorax
    const glowPulse = 0.85 + 0.15 * Math.sin(t * 3);
    ctx.save();
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.4 * glowPulse;
    ellipse(ctx, 0, s * 0.18, s * 0.2, s * 0.24, bodyGradient(ctx, s * 0.24, type.accent, type.glow)); // lantern abdomen
    ctx.restore();
    eyes(ctx, -s * 0.24, s * 0.07, s * 0.05);
  },

  moth(ctx, s, type, t) {
    const flap = 0.5 + 0.5 * Math.sin(t * 9);
    wingPair(ctx, -s * 0.08, s * 0.42, s * 0.26, -0.35, flap, 'rgba(120,200,255,0.5)');   // upper wings
    wingPair(ctx, s * 0.14, s * 0.3, s * 0.18, 0.35, flap, 'rgba(120,200,255,0.35)');     // lower wings
    for (const side of [-1, 1]) {  // glowing wing spots
      ctx.save();
      ctx.shadowColor = type.glow;
      ctx.shadowBlur = s * 0.15;
      ellipse(ctx, side * s * 0.3, -s * 0.08, s * 0.06, s * 0.06, type.glow);
      ctx.restore();
    }
    ellipse(ctx, 0, 0, s * 0.13, s * 0.3, bodyGradient(ctx, s * 0.3, type.accent, type.body)); // fuzzy body
    for (const side of [-1, 1]) {  // antennae
      ctx.strokeStyle = type.accent;
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.04, -s * 0.28);
      ctx.quadraticCurveTo(side * s * 0.16, -s * 0.42, side * s * 0.1, -s * 0.48);
      ctx.stroke();
    }
    eyes(ctx, -s * 0.22, s * 0.06, s * 0.045);
  },

  dragonfly(ctx, s, type, t) {
    const flap = 0.5 + 0.5 * Math.sin(t * 20);
    wingPair(ctx, -s * 0.1, s * 0.46, s * 0.09, -0.15, flap, 'rgba(160,255,225,0.4)');
    wingPair(ctx, s * 0.02, s * 0.42, s * 0.08, 0.15, flap, 'rgba(160,255,225,0.3)');
    ctx.save();                                        // glowing tail segments
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.2;
    for (let i = 0; i < 4; i++) {
      const alpha = 1 - i * 0.18;
      ctx.globalAlpha = alpha;
      ellipse(ctx, 0, s * (0.12 + i * 0.1), s * 0.05, s * 0.055, type.glow);
    }
    ctx.restore();
    ellipse(ctx, 0, -s * 0.1, s * 0.1, s * 0.16, bodyGradient(ctx, s * 0.16, type.accent, type.body)); // thorax
    ellipse(ctx, 0, -s * 0.27, s * 0.11, s * 0.09, type.body);                                          // head
    eyes(ctx, -s * 0.28, s * 0.055, s * 0.045);
  },

  beetle(ctx, s, type, t) {
    ellipse(ctx, 0, -s * 0.3, s * 0.14, s * 0.1, type.body);           // head peeking out
    eyes(ctx, -s * 0.31, s * 0.06, s * 0.04);
    ctx.save();
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.18;
    ellipse(ctx, 0, 0.02 * s, s * 0.3, s * 0.32, bodyGradient(ctx, s * 0.32, type.body, '#3a2a5e')); // armored shell
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';                              // shell split line
    ctx.lineWidth = s * 0.015;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(0, s * 0.34);
    ctx.stroke();
    const pulse = 0.7 + 0.3 * Math.sin(t * 2.5);                       // glowing runes
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.12;
    for (const [rx, ry] of [[-0.15, -0.08], [0.15, -0.08], [-0.12, 0.14], [0.12, 0.14], [0, 0.26]]) {
      ellipse(ctx, rx * s, ry * s, s * 0.035, s * 0.035, type.glow);
    }
    ctx.restore();
  },

  ladybug(ctx, s, type, t) {
    ellipse(ctx, 0, -s * 0.28, s * 0.15, s * 0.11, '#2e2438');         // head
    eyes(ctx, -s * 0.29, s * 0.06, s * 0.045);
    ellipse(ctx, 0, 0.03 * s, s * 0.29, s * 0.3, bodyGradient(ctx, s * 0.3, '#e26399', type.body)); // shell
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = s * 0.015;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.25);
    ctx.lineTo(0, s * 0.32);
    ctx.stroke();
    const pulse = 0.75 + 0.25 * Math.sin(t * 3);                       // glowing pink spots
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.14;
    for (const [rx, ry] of [[-0.16, -0.05], [0.16, -0.05], [-0.1, 0.18], [0.1, 0.18]]) {
      ellipse(ctx, rx * s, ry * s, s * 0.05, s * 0.05, type.glow);
    }
    ctx.restore();
  },

  lantern(ctx, s, type, t) {
    const pulse = 0.8 + 0.2 * Math.sin(t * 2);
    ctx.save();                                                        // radiant golden shell
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.5 * pulse;
    ellipse(ctx, 0, 0.04 * s, s * 0.3, s * 0.32, bodyGradient(ctx, s * 0.32, type.accent, type.body));
    ctx.restore();
    ctx.save();                                                        // ornate light pattern
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = type.glow;
    ctx.lineWidth = s * 0.02;
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.1;
    ctx.beginPath();
    ctx.arc(0, 0.04 * s, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ellipse(ctx, 0, -s * 0.3, s * 0.13, s * 0.1, type.body);           // head
    eyes(ctx, -s * 0.31, s * 0.055, s * 0.04);
    ctx.save();                                                        // tiny glowing crown
    ctx.fillStyle = type.glow;
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = s * 0.15;
    for (const dx of [-0.08, 0, 0.08]) {
      ctx.beginPath();
      ctx.moveTo((dx - 0.035) * s, -s * 0.38);
      ctx.lineTo(dx * s, -s * 0.48);
      ctx.lineTo((dx + 0.035) * s, -s * 0.38);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },
};

/** Draw one bug (sprite when available, procedural otherwise) + hp ring. */
export function drawBug(ctx, bug, time, sprite = null) {
  const s = bug.type.size * bug.scale;
  if (s <= 0) return;
  const x = bug.x;
  const y = bug.y + bug.bobY;
  const t = time + bug.phase;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 1.3) * 0.08); // gentle sway

  // soft aura behind every bug — cached sprite, not a per-frame gradient
  ctx.globalAlpha = 0.4;
  ctx.drawImage(getGlowSprite(bug.type.glow), -s * 0.9, -s * 0.9, s * 1.8, s * 1.8);
  ctx.globalAlpha = 1;

  if (sprite) {
    const d = s * 1.1;
    ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
  } else {
    PAINTERS[bug.type.id](ctx, s, bug.type, t);
  }

  if (bug.flashT > 0) { // white hit flash
    ctx.globalAlpha = bug.flashT / 0.15 * 0.7;
    ellipse(ctx, 0, 0, s * 0.34, s * 0.36, '#ffffff');
  }
  ctx.restore();

  if (bug.hp < bug.maxHp && bug.state !== 'gone') { // remaining-hp ring
    ctx.save();
    ctx.strokeStyle = bug.type.glow;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.62, -Math.PI / 2, -Math.PI / 2 + (bug.hp / bug.maxHp) * Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
