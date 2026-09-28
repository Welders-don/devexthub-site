# Сабы по 2 слова из groq_words.json; время уже абсолютное (в voice-full.wav заложены 2.0с заставки).
import json
w = json.load(open("groq_words.json"))["words"]
def ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".",",")
out=[]
for n,i in enumerate(range(0,len(w),2),1):
    g=w[i:i+2]
    out.append(f"{n}\n{ts(g[0]['start'])} --> {ts(g[-1]['end'])}\n{' '.join(x['word'].strip() for x in g).upper()}\n")
open("subs.srt","w").write("\n".join(out)); print("cues:",len(out))
