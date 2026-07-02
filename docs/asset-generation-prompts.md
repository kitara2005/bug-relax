# Asset Generation Prompts

Prompt tạo asset cho game. Ảnh dùng ChatGPT (DALL-E/GPT image), nhạc dùng Suno.
Game chạy được không cần asset — có file nào thì tự nhận file đó, làm từ từ được.

## Hình ảnh (7 ảnh → `assets/images/`)

**Mẹo:** tạo tất cả trong CÙNG một cuộc hội thoại ChatGPT. Sau ảnh đầu tiên,
các prompt sau đã có sẵn câu "Same art style as the previous image" để bộ ảnh đồng nhất.
Nếu ChatGPT không xuất được nền trong suốt → yêu cầu nền đen trơn (xử lý tách nền sau).

### 1. `background.png` — nền vườn đêm (16:9)
```
A dreamy night garden scene for a relaxing video game background, landscape 16:9. Deep dark navy and indigo tones, silhouettes of leaves, grass and flowers framing the edges, soft moonlight from above, gentle mist, tiny distant blurred light specks, magical bioluminescent atmosphere. Smooth painterly digital art, soft gradients, calm and healing mood. The center area is darker and uncluttered (gameplay happens there). No characters, no text, no watermark.
```

### 2. `bug-firefly.png` — đom đóm (glow vàng-xanh)
```
A cute kawaii firefly character for a game sprite, chubby rounded body, big friendly sparkling eyes, tiny translucent wings, glowing warm yellow-green abdomen like a lantern, soft bioluminescent aura around it. Viewed from a slight top-down angle, centered, facing left. Smooth digital art with soft gradients, dark-fantasy-but-adorable style. Transparent background, PNG, no text, no shadow on ground.
```

### 3. `bug-moth.png` — bướm đêm (glow xanh cyan)
```
Same art style as the previous image. A cute kawaii moth character for a game sprite, fluffy round body, large soft wings with glowing cyan-blue patterns like stained glass, gentle bioluminescent aura, big friendly eyes, tiny antennae. Slight top-down angle, centered, facing left. Transparent background, PNG, no text.
```

### 4. `bug-dragonfly.png` — chuồn chuồn (glow xanh ngọc)
```
Same art style as the previous image. A cute kawaii dragonfly character for a game sprite, slender glowing teal body, four elongated translucent wings with light streaks suggesting speed, bioluminescent trail glow, big friendly eyes. Slight top-down angle, centered, facing left. Transparent background, PNG, no text.
```

### 5. `bug-beetle.png` — bọ cánh cứng (glow tím)
```
Same art style as the previous image. A cute kawaii beetle character for a game sprite, sturdy rounded armored shell with glowing violet-purple rune-like patterns, small stubby legs, gentle purple aura, big friendly eyes, looks tanky but adorable. Slight top-down angle, centered, facing left. Transparent background, PNG, no text.
```

### 6. `bug-ladybug.png` — bọ rùa (glow hồng)
```
Same art style as the previous image. A cute kawaii ladybug character for a game sprite, round glossy shell with glowing soft pink spots instead of black ones, gentle rose-pink aura, tiny wings peeking out, big friendly eyes. Slight top-down angle, centered, facing left. Transparent background, PNG, no text.
```

### 7. `bug-lantern.png` — bọ lồng đèn vàng kim ("boss" hiền, hiếm)
```
Same art style as the previous image. A cute kawaii royal lantern beetle character for a game sprite, larger majestic rounded body, glowing golden amber shell with ornate light patterns, a small glowing crown-like crest, radiant warm gold aura, big gentle eyes. Slight top-down angle, centered, facing left. Transparent background, PNG, no text.
```

## Nhạc nền (5 track Suno → `assets/music/`)

Tất cả instrumental, dài 2–3 phút, xuất MP3. Game đổi track theo cấp
(1-2→track-1, 3-4→track-2, 5-6→track-3, 7-8→track-4, 9+→track-5), có crossfade.

### `track-1.mp3` — màn hình chờ / cấp 1-2 (tĩnh lặng nhất)
```
Instrumental ambient lo-fi, peaceful night garden atmosphere, soft warm pads, gentle music box melody, distant cricket sounds, slow tempo 60 bpm, dreamy reverb, no drums, calm and healing, fireflies floating in the dark
```

### `track-2.mp3` — cấp 3-4 (thêm nhịp nhẹ)
```
Instrumental chillhop, mystical night forest vibe, mellow electric piano, soft vinyl crackle, gentle brushed drums, warm sub bass, 70 bpm, moonlight serenity, relaxing and cozy, subtle glowing synth textures
```

### `track-3.mp3` — cấp 5-6 (mơ màng, lấp lánh)
```
Instrumental dreamy downtempo, twinkling celesta and kalimba over ambient pads, soft heartbeat kick, ethereal female vocal chops without words, 75 bpm, bioluminescent night garden, magical and soothing, light shimmer effects
```

### `track-4.mp3` — cấp 7-8 (sinh động hơn)
```
Instrumental melodic chillwave, hypnotic plucked synth arpeggios, smooth deep bass groove, laid-back drums, 85 bpm, enchanted midnight meadow, glowing neon fireflies, uplifting but still relaxed, spacious reverb
```

### `track-5.mp3` — cấp 9+ (đỉnh năng lượng "relax")
```
Instrumental ambient electronica, gentle euphoric build, warm analog synth layers, soft four-on-the-floor kick, sparkling bell melodies, 95 bpm, dancing lights in the night sky, joyful serenity, never aggressive, silky smooth
```

## Icon vũ khí (11 ảnh → `assets/images/`)

Icon hiện trên HUD, trong orb pha lê và banner. PNG vuông 512×512, nền trong suốt.
**Tạo cùng một cuộc hội thoại** để đồng bộ style. Chưa có ảnh nào thì game dùng emoji.

Dòng style chung cho icon đầu tiên (các icon sau thêm "Same art style as the previous image"):

> Glossy game UI icon, cute magical night theme, soft bioluminescent glow, smooth digital art,
> centered, isolated on transparent background, PNG, no text, square composition.

### 8 vũ khí theo cấp (`weapon-1.png` → `weapon-8.png`)

| File | Prompt (thêm style chung ở trên) |
|---|---|
| `weapon-1.png` | A tiny cute flashlight torch glowing warm yellow, small and humble starter weapon |
| `weapon-2.png` | A glowing mint-green energy racket like a small magical bug net, light and playful |
| `weapon-3.png` | A small blue blaster gun shaped like a shooting star, leaving a sparkling trail |
| `weapon-4.png` | An elegant crescent moon bow with a lavender glowing string, dreamy and graceful |
| `weapon-5.png` | A sleek teal laser pistol with aurora light ribbons flowing from its barrel |
| `weapon-6.png` | A chunky rounded pink cannon charged with swirling nebula energy inside a glass chamber |
| `weapon-7.png` | A floating violet crystal prism weapon refracting galaxy light beams |
| `weapon-8.png` | A majestic golden royal scepter crowned with a radiant dawn sun gem, ultimate weapon |

### 3 súng đặc biệt từ orb (`super-storm.png`, `super-nova.png`, `super-zephyr.png`)

| File | Prompt (thêm style chung ở trên) |
|---|---|
| `super-storm.png` | A powerful golden lightning bolt crackling with starlight energy, framed by a small crystal diamond shape |
| `super-nova.png` | A pink firework starburst exploding with colorful sparkles, framed by a small crystal diamond shape |
| `super-zephyr.png` | A swirling turquoise cyclone of wind and light moving at high speed, framed by a small crystal diamond shape |

## Checklist
- [x] background.png
- [x] bug-firefly.png
- [x] bug-moth.png
- [x] bug-dragonfly.png
- [x] bug-beetle.png
- [x] bug-ladybug.png
- [x] bug-lantern.png
- [x] track-1.mp3
- [x] track-2.mp3
- [x] track-3.mp3
- [x] track-4.mp3
- [x] track-5.mp3
- [ ] weapon-1.png … weapon-8.png (8 icon vũ khí)
- [ ] super-storm.png, super-nova.png, super-zephyr.png (3 icon súng đặc biệt)

Thả file đúng tên vào đúng thư mục là xong — không cần sửa code.
Ảnh bug nên là PNG vuông (1024×1024), nền trong suốt hoặc đen trơn.
