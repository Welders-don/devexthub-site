import json,base64,os,subprocess,urllib.request

# Ни одного двоеточия внутри TEXT.
TEXT=("Smallpdf makes you pay or wait twelve hours just to download your Excel file. "
      "This Chrome extension does it free. Drop the PDF, click convert, "
      "and download the clean sheet instantly. No upload, no paywall.")

STYLE=("Say with maximum enthusiasm, like a hyped tech YouTuber, fast, "
       "punchy and genuinely excited: ")

KEY=os.environ["GEMINI_API_KEY"]
URL=("https://generativelanguage.googleapis.com/v1beta/models/"
     "gemini-2.5-flash-preview-tts:generateContent?key="+KEY)

os.makedirs("voices",exist_ok=True)
for v in ["Fenrir"]:
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
