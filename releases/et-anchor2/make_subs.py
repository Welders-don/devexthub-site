import json
d = json.load(open("groq_words.json"))
OFF = 2.0  # голос стартует после стартовой карточки
def ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".",",")
out=[]
for i,w in enumerate(d["words"],1):
    out.append(f"{i}\n{ts(w['start']+OFF)} --> {ts(w['end']+OFF)}\n{w['word'].strip().upper()}\n")
open("subs.srt","w").write("\n".join(out))
print("слов:", len(d["words"]))
