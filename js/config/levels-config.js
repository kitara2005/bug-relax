// Level thresholds, difficulty curve and music mapping.
// Tuned for a relax game: ramp is slow and capped.

const THRESHOLDS = [0, 250, 650, 1250, 2100, 3250, 4750, 6650, 9000];
const EXTRA_PER_LEVEL = 2600; // each level past the table costs this much more

/** Cumulative score required to reach a 1-based level. */
export function thresholdForLevel(level) {
  if (level <= THRESHOLDS.length) return THRESHOLDS[level - 1];
  return THRESHOLDS[THRESHOLDS.length - 1] + (level - THRESHOLDS.length) * EXTRA_PER_LEVEL;
}

/** Highest level whose threshold the score has reached. */
export function levelForScore(score) {
  let level = 1;
  while (score >= thresholdForLevel(level + 1)) level++;
  return level;
}

/** Difficulty knobs for a level — everything capped to stay relaxing. */
export function difficultyForLevel(level) {
  return {
    speedMult: 1 + (level - 1) * 0.06,                       // bugs drift faster
    hpBonus: Math.floor((level - 1) / 3),                    // +1 HP per 3 levels
    spawnIntervalMs: Math.max(2400 - (level - 1) * 170, 900), // denser spawns over time
    maxBugs: Math.min(4 + (level - 1), 14),                   // screen fills up as levels rise
  };
}

/** Which Suno track (1..5) plays at a level: 1-2→1, 3-4→2, ... 9+→5. */
export function musicTrackForLevel(level) {
  return Math.min(Math.ceil(level / 2), 5);
}
