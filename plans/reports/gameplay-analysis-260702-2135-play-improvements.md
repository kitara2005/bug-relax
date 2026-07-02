# Gameplay Behavior Analysis & Improvement Proposals

Date: 2026-07-02 | Trigger: user feedback "bắn nhiều mỏi tay" + request to improve engagement

## Behavior math (why fatigue is real, not subjective)

- Spawn rate L6: interval ~0.78s → ~77 bugs/min. L9+: 0.45-0.53s → 110-130 bugs/min.
- Taps per bug: HP bonus (+1/2 levels) vs weapon damage growth → sustained 1-2 taps/bug. Plus aim travel.
- Required sustained input: **1.5-2.5 precise taps/giây, liên tục, khắp màn hình**.
- Benchmark: casual/relax games target <0.5 deliberate action/s (merge, idle) or low-precision
  sweeping (Fruit Ninja swipe ≈ 1 gesture hits many). Ours = high-frequency + high-precision = arcade
  twitch, mâu thuẫn với positioning "relax". Fatigue trong ~2 phút là tất yếu, nhất là trên phone
  (giơ tay chạm liên tục).
- Kết luận: **NÊN improve — đây là mâu thuẫn thiết kế cốt lõi**, không phải chuyện cá nhân.

## Proposals (ranked by impact/effort)

### P1 — Hold-to-sweep auto-fire (fatigue killer, khuyến nghị làm ngay)
Giữ ngón tay/chuột → vũ khí tự bắn theo đúng cooldown tại vị trí con trỏ; kéo lướt qua bug để diệt.
Tap đơn vẫn như cũ. Giảm ~80% cử động, đổi cảm giác từ "gõ mổ cò" sang "quét đèn soi vườn" —
hợp fantasy đèn pin bắt côn trùng. Cooldown giữ nguyên nên DPS không đổi → không phá cân bằng.
Effort: nhỏ (pointer-input thêm hold state + main loop autofire). Risk: thấp.

### P2 — Base splash nhẹ cho tier cao (late-game density relief)
Tier 5-8 thêm splash 40/50/60/70px (nhỏ hơn nhiều Nova 130px). Một chạm ăn cụm 2-3 con sát nhau.
Giữ x2 density mà không cần x2 taps. Effort: nhỏ (weapons-config + combat đã hỗ trợ splashRadius).

### P3 — Combo milestone thưởng mạng (engagement loop)
Mỗi 15 combo → +1 🧡 (cap 15). Tạo comeback mechanic, cho combo giá trị ngoài điểm,
thưởng người chơi giỏi bằng "thở thêm". Effort: rất nhỏ (game-state + banner).

### P4 — Frenzy wave (nhịp thưởng)
Mỗi ~80s: bầy 8-12 đom đóm bonus (1HP, thoát KHÔNG trừ mạng) tràn qua màn hình 6s.
Nhịp "farm điểm sướng tay" xen giữa nhịp phòng thủ — pacing wave giúp game bớt đơn điệu.
Effort: trung bình (spawner mode + visual cue).

### P5 — High score localStorage (retention)
User từng chọn "không lưu gì" — đề xuất xem lại chỉ 1 số high score: lý do quay lại chơi.
Effort: rất nhỏ. Cần user đồng ý đổi quyết định cũ.

### P6 — Zen mode (chế độ phụ, không mạng, chơi thiền túy) — backlog.

## Recommendation
Implement P1 + P2 (fix fatigue), P3 (engagement) trong một đợt. P4/P5 đợt sau nếu ưng.

## Unresolved questions
- P5 mâu thuẫn quyết định "no persistence" trước đó — cần user chốt.
- 15 mạng + density x2 hiện tại: cần playtest lại sau P1/P2 (kill throughput tăng → có thể giữ).
