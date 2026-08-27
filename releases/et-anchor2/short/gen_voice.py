import json,base64,os,subprocess,urllib.request

TEXT=("See this text? It is an image. You cannot select it. "
      "So use Extract Text from Image. Hit Start selection and drag a box around it. "
      "Two seconds later the text is right there. Copy it or download it. "
      "Free, right in Chrome.")

# ОДНА фраза с двоеточием на конце — длинный многофразовый промпт протекает в аудио
STYLE="Say with maximum enthusiasm, like a hyped tech YouTuber, fast, punchy and genuinely excited: "

VOICE="Fenrir"   # шорты = Fenrir (решение Дениса 20.08), Puck остаётся на лонги
KEY=os.environ["GEMINI_API_KEY"]
URL=("https://generativelanguage.googleapis.com/v1beta/models/"
     "gemini-2.5-flash-preview-tts:generateContent?key="+KEY)

body={"contents":[{"parts":[{"text":STYLE+TEXT}]}],
      "generationConfig":{"responseModalities":["AUDIO"],
        "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":VOICE}}}}}
req=urllib.request.Request(URL,data=json.dumps(body).encode(),
    headers={"Content-Type":"application/json"})
d=json.load(urllib.request.urlopen(req))
p=d["candidates"][0]["content"]["parts"][0]["inlineData"]
open("voice.pcm","wb").write(base64.b64decode(p["data"]))
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","s16le","-ar","24000",
                "-ac","1","-i","voice.pcm","-af","loudnorm=I=-14:TP=-1.5:LRA=11",
                "voice.wav"],check=True)
dur=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                    "-of","default=nk=1:nw=1","voice.wav"],
                   capture_output=True,text=True).stdout.strip()
print(f"{VOICE}: {float(dur):.2f}s")
