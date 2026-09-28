import json,base64,os,subprocess,urllib.request
TEXT="PDF table pasted into one column? Drop the PDF here, hit convert, download CSV. Every value in its own cell. Free in Chrome."
STYLE="Read this in an energetic, upbeat, fast-paced hyped YouTuber voice: "
URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key="+os.environ["GEMINI_API_KEY"]
body={"contents":[{"parts":[{"text":STYLE+TEXT}]}],"generationConfig":{"responseModalities":["AUDIO"],
  "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Fenrir"}}}}}
d=json.load(urllib.request.urlopen(urllib.request.Request(URL,data=json.dumps(body).encode(),headers={"Content-Type":"application/json"}),timeout=120))
open("Fenrir.pcm","wb").write(base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]))
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","s16le","-ar","24000","-ac","1","-i","Fenrir.pcm",
  "-af","silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-14:TP=-1.5:LRA=11",
  "-ar","48000","Fenrir.wav"],check=True)
