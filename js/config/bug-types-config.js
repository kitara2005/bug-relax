// Bug type definitions: stats, colors, spawn weights per level.
// speed = px/second base; size = sprite diameter in px; lifetime = seconds on screen before escaping.

export const BUG_TYPES = {
  firefly: {
    id: 'firefly',
    name: 'Đom đóm',
    hp: 1,
    speed: 28,
    points: 10,
    size: 46,
    lifetime: [10, 13],
    glow: '#d8ff7a',
    body: '#8fc94f',
    accent: '#fff6c2',
    minLevel: 1,
    weight: (lv) => Math.max(6 - lv * 0.3, 2),
  },
  moth: {
    id: 'moth',
    name: 'Bướm đêm',
    hp: 2,
    speed: 34,
    points: 20,
    size: 58,
    lifetime: [9, 12],
    glow: '#7ad7ff',
    body: '#5b7fb8',
    accent: '#d8f4ff',
    minLevel: 1,
    weight: () => 3,
  },
  dragonfly: {
    id: 'dragonfly',
    name: 'Chuồn chuồn',
    hp: 2,
    speed: 62,
    points: 30,
    size: 54,
    lifetime: [8, 10],
    glow: '#5fffd1',
    body: '#2fbf9b',
    accent: '#c8fff0',
    minLevel: 2,
    weight: (lv) => Math.min(1 + lv * 0.4, 4),
  },
  beetle: {
    id: 'beetle',
    name: 'Bọ cánh cứng',
    hp: 4,
    speed: 22,
    points: 45,
    size: 62,
    lifetime: [11, 14],
    glow: '#c48aff',
    body: '#6a4b9e',
    accent: '#e8d4ff',
    minLevel: 3,
    weight: (lv) => Math.min(0.5 + lv * 0.35, 3.5),
  },
  ladybug: {
    id: 'ladybug',
    name: 'Bọ rùa',
    hp: 3,
    speed: 42,
    points: 35,
    size: 50,
    lifetime: [9, 11],
    glow: '#ff9ad5',
    body: '#c2477e',
    accent: '#ffd9ec',
    minLevel: 4,
    weight: (lv) => Math.min(0.5 + lv * 0.3, 3),
  },
  lantern: {
    id: 'lantern',
    name: 'Bọ lồng đèn',
    hp: 9,
    speed: 18,
    points: 150,
    size: 80,
    lifetime: [12, 15],
    glow: '#ffd97a',
    body: '#b8862f',
    accent: '#fff2c8',
    minLevel: 3,
    weight: () => 0.35, // rare golden "boss" — high reward
  },
};

/** Weighted-random pick of a bug type available at the given level.
 *  unlockAll (relax mode): every type can appear regardless of level, weighted
 *  as if mid-game so all 6 kinds show up in a pleasant balanced mix. */
export function pickBugType(level, rng = Math.random, unlockAll = false) {
  const available = Object.values(BUG_TYPES).filter((t) => unlockAll || level >= t.minLevel);
  const weightLevel = unlockAll ? Math.max(level, 5) : level;
  const total = available.reduce((sum, t) => sum + t.weight(weightLevel), 0);
  let roll = rng() * total;
  for (const type of available) {
    roll -= type.weight(weightLevel);
    if (roll <= 0) return type;
  }
  return available[available.length - 1];
}
