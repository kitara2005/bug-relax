# Brutal Gameplay Review — bug findings

Date: 2026-07-02 | Method: full source read + Playwright runtime edge-case tests | All confirmed live.
**Status: H1, M1, L1, L2, L3 all FIXED and re-verified 2026-07-02 (commit below).**

## HIGH

### H1 — Súng tự bắn kẹt vĩnh viễn khi thả chuột ngoài canvas
`pointer-input.js` chỉ nghe `pointerup`/`pointercancel` trên **canvas**. Thả chuột trên
element khác (nút mute góc phải, overlay game-over) → canvas không nhận `pointerup` →
`input.down` kẹt `true`. main.js:103 tiếp tục auto-fire mãi dù người chơi đã nhả tay.
Reachable ngay trong lúc chơi bình thường (nhấn-giữ rồi nhả trên nút 🔊). Cũng gây
auto-fire ngay sau khi bấm Chơi lại. **Confirmed:** release trên nút → `input.down` vẫn true.
Fix: pointerId + `setPointerCapture`, hoặc nghe pointerup/cancel trên `window`; reset
`input.down=false` trong restart()/endRun().

## MEDIUM

### M1 — Nhiều "-1 🧡" sai số khi nhiều bug thoát cùng frame lúc cận tử
main.js:120-132 lặp tiếp sau khi hết mạng. Người còn 2 mạng, 4 bug thoát cùng frame →
hiện **4** text "-1 🧡" (đúng ra chỉ nên 2). `registerEscape` clamp lives về 0 nên số mạng
đúng, nhưng feedback hình sai lệch, gây hiểu nhầm. **Confirmed:** lives 2→0, 4 text "-1".
Fix: dừng xử lý escape khi `state.phase==='gameover'` (break trong loop).

## LOW

### L1 — Crossfade nhạc chồng interval
`audio-manager.js:61` mỗi `setMusicForLevel` tạo `setInterval` mới, không clear cái cũ.
Lên cấp dồn dập (super rapid-fire) → nhiều interval tranh volume cùng track → glitch âm.
Fix: lưu id, `clearInterval` trước khi tạo mới.

### L2 — Hit-box lệch bobY
`bug-entity.js:123 containsPoint` dùng `this.y`, nhưng bug vẽ ở `this.y + bobY` (±5px).
Lệch ~5px so với hình. hitRadius rộng (~30px) nên hiếm khi hụt, nhưng về lý là sai.
Fix: `containsPoint` cộng `bobY`.

### L3 — Orb "nuốt" cú chạm dù chưa vỡ
`combat-controller.js:16-22` chạm trúng orb (chưa vỡ) vẫn `return` → bug phía sau orb
không ăn đạn cú đó. Chấp nhận được (orb ưu tiên) nhưng đáng lưu ý khi orb đè lên cụm bug.

## Không phải bug (đã kiểm, OK)
- Bonus bug thoát free: đúng (escaped=false set trước check isBonus).
- Kill vs escape: mutually exclusive state, không double-count.
- Pause khi tab ẩn: hoạt động đúng.
- Splash + combo/level-up dồn: đúng ý đồ.
- restart() reset super/lives/combo: đúng.

## Đề xuất
Fix H1 ngay (ảnh hưởng chơi bình thường). M1 + L1 + L2 gộp một đợt. L3 để nguyên.

## Unresolved
- Cân bằng: giữ-để-quét + splash làm sát thương tăng mạnh; chưa playtest người thật xem
  15 mạng + density x2 có quá dễ/khó không (ngoài phạm vi review kỹ thuật).
