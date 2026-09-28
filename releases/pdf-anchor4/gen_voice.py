# Голос лонга #4 (pdf to csv, ~1:50) по блокам: у каждого сегмента свой клип, длина сегмента = клип + пауза.
# Ни одного двоеточия внутри текстов.
import json,base64,os,subprocess,urllib.request,sys
PARTS=[
 "Copy a table out of a PDF, paste it into a spreadsheet, and everything lands in one column. Here's how to convert a PDF to CSV for free, with every value in its own cell.",
 "First, add Convert PDF to Excel from the Chrome Web Store. It's free, and the link is below.",
 "Here's a two page bank statement. Dates, descriptions, debits, credits and a running balance.",
 "Click the puzzle icon, pick the extension, and the side panel opens. Pin it, so it's always one click away.",
 "Drop the PDF into the panel, or click to pick the file.",
 "Hit Convert to Excel. Text based PDFs are read right in your browser, so nothing gets uploaded.",
 "Two pages, fifty three rows. Now click Download CSV. If you'd rather have a spreadsheet file, take the xlsx.",
 "Open the CSV in Excel or Google Sheets. Date, description, debit, credit and balance, each in its own column, line for line with the PDF.",
 "Got a scanned PDF instead? The extension spots it and offers AI mode, which reads the scan on our server and rebuilds the table.",
 "And unlike online converters such as Smallpdf, there's no account and no paywall when you download.",
 "That's how to convert a PDF to CSV for free, right in Chrome.",
]
STYLE="Read this in a clear, friendly, confident tutorial voice at a natural pace: "
KEY=os.environ["GEMINI_API_KEY"]
URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key="+KEY
os.makedirs("voices",exist_ok=True)
only=[int(x) for x in sys.argv[1:]] or range(1,len(PARTS)+1)
for i in only:
    body={"contents":[{"parts":[{"text":STYLE+PARTS[i-1]}]}],
          "generationConfig":{"responseModalities":["AUDIO"],
            "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Puck"}}}}}
    req=urllib.request.Request(URL,data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
    d=json.load(urllib.request.urlopen(req,timeout=120))
    raw=f"voices/v{i:02d}.pcm"
    open(raw,"wb").write(base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]))
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","s16le","-ar","24000","-ac","1","-i",raw,
        "-af","silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-14:TP=-1.5:LRA=11",
        "-ar","48000",f"voices/v{i:02d}.wav"],check=True)
    dur=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",f"voices/v{i:02d}.wav"],capture_output=True,text=True).stdout.strip()
    print(f"v{i:02d}: {float(dur):.2f}s",flush=True)
