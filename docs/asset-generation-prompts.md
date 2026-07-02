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

## Checklist
- [ ] background.png
- [ ] bug-firefly.png
- [ ] bug-moth.png
- [ ] bug-dragonfly.png
- [ ] bug-beetle.png
- [ ] bug-ladybug.png
- [ ] bug-lantern.png
- [ ] track-1.mp3
- [ ] track-2.mp3
- [ ] track-3.mp3
- [ ] track-4.mp3
- [ ] track-5.mp3

Thả file đúng tên vào đúng thư mục là xong — không cần sửa code.
Ảnh bug nên là PNG vuông (1024×1024), nền trong suốt hoặc đen trơn.
