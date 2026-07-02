# Plan: Đêm Đom Đóm (bug-relax)

**Status:** Shipped (v1) | **Design:** ../../docs/game-design-document.md

Single-phase build (small greenfield project, no deps).

## Phases
- [x] Phase 0: Design approved (brainstorming session 2026-07-02)
- [x] Phase 1: Implement full game (modules per GDD layout, procedural placeholders)
- [x] Phase 2: Smoke test (Playwright: load, start, shoot-kill verified; only expected 404s for optional assets)
- [x] Phase 3: Git init + push to github.com/kitara2005/bug-relax
- [x] Tuning (user feedback 2026-07-02): bug lifetime 8-15s, maxBugs 4→14 (+1/level), spawn 2400→900ms
- [ ] Phase 4 (user): drop ChatGPT sprites into assets/images/, Suno tracks into assets/music/

## Key decisions
- Procedural-first rendering: game playable with zero binary assets; loader auto-swaps
  to PNG/MP3 when files present (onerror fallback). No code change needed later.
- No persistence, no build tooling, ES modules served statically.
- UI language: Vietnamese.

## Success criteria
- Loads on desktop + mobile browser, 60fps typical scene (<10 bugs + particles).
- Tap accuracy comfortable on phone (hit radius ≥1.3× sprite).
- Difficulty ramp matches GDD table; combo/level math correct.
- Repo pushed with README, docs, clean structure.

## Unresolved
- Real assets pending from user (ChatGPT images, Suno tracks) — game must not depend on them.
