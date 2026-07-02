# Đêm Đom Đóm (bug-relax) — Game Design Document

**Date:** 2026-07-02 | **Status:** Approved | **Repo:** github.com/kitara2005/bug-relax

## Concept
Relax web game. Night garden, glowing insects drift in, player taps/clicks to catch them.
Each run starts with 15 lives; every escaped bug costs one. 0 lives → game over → replay.
Score, combo, gentle progression. Mobile + desktop.

## Core Loop
1. Bugs spawn gradually at random positions, hover with soft motion, glow pulsing.
2. Player taps a bug → weapon deals damage. Bug dies → light burst + points.
3. Bug left alone for its lifetime → flies off screen → combo resets AND -1 life (of 15).
4. Score thresholds → level up → stronger weapon, bugs get tankier + faster (slow ramp).
5. Lives hit 0 → summary screen (score / level / best combo) → "Chơi lại" restarts fresh.

## Systems

### Bugs (6 types)
| Type | HP | Speed | Points | Notes |
|---|---|---|---|---|
| Đom đóm (firefly) | 1 | slow | 10 | common early |
| Bướm đêm (moth) | 2 | slow | 20 | |
| Chuồn chuồn (dragonfly) | 2 | fast | 30 | from lv2 |
| Bọ cánh cứng (beetle) | 4 | slow | 45 | tanky, from lv3 |
| Bọ rùa (ladybug) | 3 | med | 35 | from lv4 |
| Bọ lồng đèn (lantern) | 9 | slow | 150 | rare golden "boss", from lv3 |

Lifecycle: spawn (scale-in) → wander (sin wobble drift) → escape (accelerate to edge).
HP gets small bonus at high levels. Hit shows flash + hp ring arc.

### Weapons (8 tiers, unlocked by level)
Tap OR hold-to-sweep: holding the pointer auto-fires at its position at the weapon's
cooldown rate (anti-fatigue — drag across bugs instead of tapping each one).
Tiers differ in damage + cooldown + color; tiers 5-8 add built-in splash 40/50/60/70px.
Damage 1→6, cooldown 400ms→160ms. Icons: assets/images/weapon-<tier>.png (emoji fallback).

### Combo & Score
- Kill: combo +1. Multiplier = 1 + floor(combo/5), capped ×5.
- Every 15 combo → +1 life back (capped at 15) — comeback mechanic.
- Bug escapes: combo → 0, -1 life. No score loss.
- Points = base × multiplier, floating text shows gain.

### Frenzy waves
Every ~75-90s a swarm of 10 bonus fireflies drips in over ~2s (banner + chime announce it).
They stay only 4.5-6.5s; killing scores normally, escaping costs NOTHING — pure reward pacing.

### UI language
International: icons + numbers only (Lv N, 🧡 N, 🔥 N ×M, weapon icon). Title "Firefly Night".
No Vietnamese/English words in gameplay UI.

### Levels & Difficulty
- Thresholds: 0, 250, 650, 1250, 2100, 3250, 4750, 6650, 9000, then +2600/level.
- Per level: spawn interval 1200ms → min 450ms, max concurrent bugs 8 → 28
  (+2 per level — screen fills up over time), speed ×(1 + 0.06/level), HP bonus +1 per 2 levels.
- Bug lifetime generous (8–15s per type) so pace stays relaxed even when dense.

### Power-up Orbs (temporary super weapons)
- From level 2, a glowing crystal orb spawns every ~18-32s (one at a time, stays 10s).
- Shoot it twice to break → random super weapon for 15s (HUD shows golden countdown chip):
  - ⚡ Bão Sao Băng — damage ×3
  - 🎆 Pháo Hoa Nova — splash: every bug within 130px of the tap takes the hit
  - 🌪️ Gió Thần Tốc — cooldown 70ms (rapid fire)
- Expires back to the level-tier weapon. Orb ignored → fades away, no penalty.
- Level up: banner, weapon swap, light confetti, possible music track change.

## Art Direction
"Ban đêm huyền ảo": deep navy/indigo night garden, bioluminescent kawaii insects, soft neon glow.
- **Assets (user-provided via ChatGPT):** `background.png` + 6 bug PNGs in `assets/images/`.
- **Fallback:** everything drawn procedurally (canvas gradients, shadowBlur, `lighter` composite)
  so game is fully playable with zero assets. Sprite auto-used when file exists.
- Effects always procedural: hit sparks, death burst, ripples, floating score, drifting motes.

## Audio
- **Music:** 5 Suno tracks (user-provided) `assets/music/track-1..5.mp3`.
  Level mapping: 1-2→t1, 3-4→t2, 5-6→t3, 7-8→t4, 9+→t5. Crossfade on change. Silent if missing.
- **SFX:** procedural WebAudio (shoot pluck, hit tick, kill chime, level-up arpeggio, soft escape tone).
- Mute button. Audio starts on first user gesture (autoplay policy).

## Tech
- Vanilla JS ES modules + Canvas 2D. No build step, no deps. Static hosting ready.
- Responsive fullscreen canvas, devicePixelRatio (cap 2), touch-action none,
  hit radius padded ~1.3× for touch. Pause on tab hidden.
- No persistence (per requirement).

## Module Layout (each file <200 lines)
```
index.html, css/style.css
js/main.js                      — boot, game loop, wiring
js/config/{bug-types,weapons,levels}-config.js
js/core/{game-state,bug-spawner}.js
js/entities/{bug-entity,particle-system,floating-text}.js
js/render/{canvas-renderer,night-background-painter,procedural-bug-painter}.js
js/systems/{pointer-input,audio-manager,asset-loader,hud-controller}.js
assets/images/  assets/music/   — user drops real assets here
```

## Testing
Pure logic (state, combo, level math) isolated from render. Manual + Playwright smoke test
(load page, start, click, no console errors).
