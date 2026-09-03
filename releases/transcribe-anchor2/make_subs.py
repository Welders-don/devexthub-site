#!/usr/bin/env python3
"""
Пословные сабы для лонга из word-таймингов Groq STT.
Группами по 3-4 слова, ставятся В ВЕРХНЕЙ ТРЕТИ кадра: снизу уже стоят смысловые
титры, два текстовых слоя в одном месте = шум (грабля из рецепта шортов).

Сдвиг OFFSET = adelay озвучки в build.sh (300 мс).
Usage: python3 make_subs.py > work/subs.ass
"""
import json, sys

OFFSET = 2.0
GROUP = 4
words = json.load(open('work/words.json'))['words']

def ts(t):
    t = max(0.0, t + OFFSET)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

print("""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,DejaVu Sans,52,&H00FFFFFF,&H00141414,&H00141414,1,3,6,0,2,80,80,64,1

[Events]
Format: Layer, Start, End, Style, Text""")

# группа рвётся по знаку препинания, иначе фразы режутся посередине
# («only 400 pixels. The» — так было при слепой нарезке по 4)
chunks, cur = [], []
for w in words:
    cur.append(w)
    if len(cur) >= GROUP or w['word'].rstrip().endswith(('.', ',', '!', '?')):
        chunks.append(cur); cur = []
if cur:
    chunks.append(cur)

for chunk in chunks:
    text = ' '.join(w['word'] for w in chunk)
    print(f"Dialogue: 0,{ts(chunk[0]['start'])},{ts(chunk[-1]['end'])},Sub,{text}")
