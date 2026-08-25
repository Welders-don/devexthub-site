import json,base64,os,subprocess,urllib.request

TEXT=("Thirty five minutes of tutorial? Nobody has time for that. "
      "One click in the side panel and the whole video is text, with timestamps. "
      "Want it in Japanese? Just switch the language. "
      "Export to Word and read it in two minutes. Free, right in Chrome.")

STYLE=("Say with maximum enthusiasm, like a hyped tech YouTuber, fast, punchy and genuinely excited: ")

VOICES=["Puck","Fenrir","Laomedeia","Sadachbia"]
KEY=os.environ["GEMINI_API_KEY"]
URL=("https://generativelanguage.googleapis.com/v1beta/models/"
     "gemini-2.5-flash-preview-tts:generateContent?key="+KEY)

for v in VOICES:
    body={"contents":[{"parts":[{"text":STYLE+TEXT}]}],
          "generationConfig":{"responseModalities":["AUDIO"],
            "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":v}}}}}
    req=urllib.request.Request(URL,data=json.dumps(body).encode(),
        headers={"Content-Type":"application/json"})
    d=json.load(urllib.request.urlopen(req))
    p=d["candidates"][0]["content"]["parts"][0]["inlineData"]
    raw=f"voices/{v}.pcm"
    open(raw,"wb").write(base64.b64decode(p["data"]))
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","s16le","-ar","24000",
                    "-ac","1","-i",raw,"-af","loudnorm=I=-14:TP=-1.5:LRA=11",
                    f"voices/{v}.mp3"],check=True)
    dur=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                        "-of","default=nk=1:nw=1",f"voices/{v}.mp3"],
                       capture_output=True,text=True).stdout.strip()
    print(f"{v}: {float(dur):.2f}s")
