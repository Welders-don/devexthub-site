#!/usr/bin/env python3
# Пословные сабы из groq_words.json → subs.srt. Сдвиг = старт голоса в ролике (карточка 2.0с).
import json

OFFSET = 2.0
PER = 2  # слов в титре

w = json.load(open("groq_words.json"))["words"]


def ts(t):
    t += OFFSET
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}".replace(".", ",")


out, n = [], 1
for i in range(0, len(w), PER):
    grp = w[i:i + PER]
    text = " ".join(x["word"] for x in grp).upper().strip()
    out.append(f"{n}\n{ts(grp[0]['start'])} --> {ts(grp[-1]['end'])}\n{text}\n")
    n += 1

open("subs.srt", "w").write("\n".join(out))
print(f"ok: subs.srt, {n - 1} cues")
