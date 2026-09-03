import json,base64,os,subprocess,urllib.request

TEXT=("Got a podcast you want in text? Open it in your browser and hit Transcribe. "
      "The words appear as the episode plays, split by speaker, timestamps on. "
      "Then export the whole thing to Word. Free, in Chrome.")

# Fenrir + энергичная подача — рецепт залетевшего PDF-шорта.
STYLE="Read this in an energetic, upbeat, fast-paced hyped YouTuber voice: "

KEY=os.environ["GEMINI_API_KEY"]
URL=("https://generativelanguage.googleapis.com/v1beta/models/"
     "gemini-2.5-flash-preview-tts:generateContent?key="+KEY)

body={"contents":[{"parts":[{"text":STYLE+TEXT}]}],
      "generationConfig":{"responseModalities":["AUDIO"],
        "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Fenrir"}}}}}
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
print(f"Fenrir: {float(dur):.2f}s")
