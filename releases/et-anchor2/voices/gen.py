import json,base64,os,subprocess,urllib.request

TEXT=("You can see the text in this image, but you can't select it. It's just pixels. "
      "Click the extension, hit Start selection, and draw a box over the picture. "
      "It reads the words right on your device, nothing gets uploaded anywhere. "
      "Then copy the text, or download it as a clean text file. "
      "Every line, every number, exactly as it was. Free, in Chrome.")

# ОДНОЙ фразой с двоеточием на конце: длинный многофразовый стиль-промпт ПРОТЕКАЕТ в аудио.
STYLE="Read this in a clear, friendly, confident tutorial voice at a natural pace: "

VOICES=["Puck","Kore","Erinome","Despina"]
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
