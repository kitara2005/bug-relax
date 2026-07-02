# 🌙 Đêm Đom Đóm (bug-relax)

Game web thư giãn: khu vườn ban đêm, côn trùng phát sáng bay lượn — chạm vào chúng để thu thập ánh sáng. Không thua, không áp lực, chỉ relax.

**Chơi thử:** mở `index.html` qua một static server bất kỳ (game dùng ES modules nên không mở trực tiếp bằng `file://` được):

```bash
npx serve .          # hoặc
python3 -m http.server 8080
```

## Gameplay
- Bug xuất hiện từ từ ở vị trí ngẫu nhiên, lơ lửng vài giây rồi bay đi
- Mỗi lượt có **50 mạng** — bug trốn thoát trừ 1 mạng + mất combo; hết mạng thì chơi lại
- Tap/click để bắn — mỗi cấp mở **vũ khí mạnh và nhanh hơn** (8 tier)
- Bắn trúng liên tiếp → **combo** nhân điểm (tối đa ×5)
- **Orb pha lê** thỉnh thoảng xuất hiện: bắn 2 phát vỡ → nhận súng đặc biệt 15 giây (dame ×3 / bắn lan / liên thanh)
- Lên cấp: bug nhiều máu + nhanh + đông hơn — độ khó tăng từ từ
- 6 loại bug: đom đóm, bướm đêm, chuồn chuồn, bọ cánh cứng, bọ rùa và bọ lồng đèn vàng hiếm (150 điểm)

## Công nghệ
Vanilla JS + Canvas 2D, **không build step, không dependency**. Chạy tốt trên desktop và điện thoại (touch, responsive, devicePixelRatio).

## Asset tùy chọn
Game **chơi được ngay không cần asset** — mọi hình ảnh/hiệu ứng vẽ procedural bằng canvas, SFX tạo bằng WebAudio. Muốn nâng cấp hình ảnh và nhạc, thả file vào:

| Đường dẫn | Nội dung |
|---|---|
| `assets/images/background.png` | nền vườn đêm (16:9) |
| `assets/images/bug-firefly.png` … `bug-moth / bug-dragonfly / bug-beetle / bug-ladybug / bug-lantern.png` | sprite bug, PNG nền trong suốt, vuông |
| `assets/music/track-1.mp3` … `track-5.mp3` | nhạc nền theo cấp (1-2→t1, 3-4→t2, 5-6→t3, 7-8→t4, 9+→t5) |

File nào có thì game tự dùng, thiếu thì tự fallback — không cần sửa code.

## Cấu trúc
```
js/config/    — chỉ số bug, vũ khí, level & độ khó
js/core/      — game state (điểm/combo/cấp), spawner
js/entities/  — bug, particle, floating text
js/render/    — canvas, nền đêm, vẽ bug procedural
js/systems/   — input, audio, asset loader, HUD
docs/         — game design document
```
