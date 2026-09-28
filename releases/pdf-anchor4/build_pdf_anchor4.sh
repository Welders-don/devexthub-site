#!/usr/bin/env bash
# PDF-to-Excel лонг #4 (pdf to csv), первый настоящий how-to ~1:25 (решение 28.09: лонги 30с для поиска тонкие).
# NEW  = src/compressed_2026-09-28_13-52-59.mp4 (Денис 28.09, v1.1.0, EN Chrome). Блюр адреса (D:/Users/torop) и вкладки.
# SCAN = ../video-samples/raw_3656232/2026-08-02 11-16-48.mp4 (скан, v1.0.5), Excel только сеткой, без шапки с именем.
# SPDF = ../pdf-anchor3/src/compressed_2026-09-07_11-15-51.mp4 (smallpdf, стена оплаты).
# Голос voices/vNN.wav (gen_voice.py), сегмент = голос + GAP.
set -e
cd /home/client/projects/Devexthub-site/releases/pdf-anchor4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39; RED=0xB00020
NEW=src/compressed_2026-09-28_13-52-59.mp4
SCAN="../video-samples/raw_3656232/2026-08-02 11-16-48.mp4"
SPDF=../pdf-anchor3/src/compressed_2026-09-07_11-15-51.mp4
GAP=0.6
vd () { ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 voices/v$1.wav; }
dur () { python3 -c "print(round($(vd $1)+$GAP,2))"; }
ENC="-r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000"
title () { echo "drawtext=fontfile=${F}:text='$1':fontcolor=white:fontsize=46:box=1:boxcolor=$2@0.95:boxborderw=16:x=$3:y=24"; }

# SRC START SRCLEN OUTDUR "CHAIN" N  — если исходник короче, последний кадр держится (tpad clone)
seg () {
  ffmpeg -hide_banner -loglevel error -y -ss "$2" -t "$3" -i "$1" -an -filter_complex "
    [0:v]$5,tpad=stop_mode=clone:stop_duration=30,trim=duration=$4,setpts=PTS-STARTPTS[v]" -map "[v]" $ENC "seg_$6.mp4"
}
# окно Chrome из NEW с блюром адреса и первой вкладки
WIDE="crop=1920:1020:0:0,split[a][b];[b]crop=1440:40:160:60,boxblur=10:2[u];[a][u]overlay=160:60,split[c][d];[d]crop=300:40:55:6,boxblur=10:2[t];[c][t]overlay=55:6,pad=1920:1080:0:30:color=black"
PANEL="crop=450:900:1450:110,scale=-2:960,pad=1920:1080:(ow-iw)/2:100:color=${BG}"
XL="crop=1500:620:400:300,scale=1920:-2,pad=1920:1080:0:(oh-ih)/2:color=black"
SPANEL="crop=440:880:1465:125,scale=-2:960,pad=1920:1080:(ow-iw)/2:100:color=${BG}"
SXL="crop=1824:750:76:180,scale=1920:-2,pad=1920:1080:0:(oh-ih)/2:color=black"
SPLIT="crop=450:320:1450:250,scale=-2:680,pad=1920:1080:(ow-iw)/2:200:color=${BG}"
DATES="crop=450:630:840:300,scale=-2:900,pad=1920:1080:(ow-iw)/2:120:color=${BG}"
JUNK="crop=1060:620:840:300,drawbox=x=2:y=168:w=1056:h=216:color=red@0.9:t=5,scale=-2:900,pad=1920:1080:(ow-iw)/2:120:color=${BG}"
SMALL="crop=1920:1013:0:0,pad=1920:1080:0:(oh-ih)/2:color=black"

# картинка: IMG DUR "TITLE" BOX N
still () {
  ffmpeg -hide_banner -loglevel error -y -loop 1 -framerate 30 -t "$2" -i "$1" -vf "
    scale=1920:1080,zoompan=z='min(1+0.0006*on,1.08)':x='0':y='0':d=1:s=1920x1080:fps=30,$(title "$3" "$4" 40)" $ENC "seg_$5.mp4"
}
# карточка: T1 T2 DUR N
card () {
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=${BG}:s=1920x1080:d=$3:r=30" -loop 1 -t "$3" -i icon.png \
    -filter_complex "[1:v]scale=180:180[ic];[0:v][ic]overlay=(W-w)/2:(H/2)-380[bg];
      [bg]drawtext=fontfile=${F}:text='$1':fontcolor=white:fontsize=92:x=(w-tw)/2:y=(h/2)-120,
          drawtext=fontfile=${FR}:text='$2':fontcolor=0xD7F0E1:fontsize=46:x=(w-tw)/2:y=(h/2)+20" $ENC "seg_$4.mp4"
}

card  "PDF to CSV, Free" "Every value in its own cell"                     2.0          00
still mock/paste.png $(dur 01) "Pasted from a PDF - one column" "$RED"                  01
card  "Convert PDF to Excel" "Free on Chrome Web Store"                    $(dur 02)    02
seg "$NEW" 29.0 8   $(dur 03) "$WIDE,$(title 'A 2-page bank statement' $BG 40)"         03
seg "$NEW" 44.0 7.5 $(dur 04) "$WIDE,$(title 'Puzzle icon - open the panel' $BG 40)"    04
seg "$NEW" 58.5 5   $(dur 05) "$WIDE,$(title 'Drop the PDF or pick the file' $BG 40)"   05
seg "$NEW" 64.0 3   $(dur 12) "$SPLIT,$(title 'Split pages into sheets' $BG '(w-tw)/2')"  05s
seg "$NEW" 63.5 6.5 $(dur 06) "$PANEL,$(title 'Convert - no upload' $BG '(w-tw)/2')"    06
seg "$NEW" 70.0 9   $(dur 07) "$PANEL,$(title 'Download .csv' $BG '(w-tw)/2')"          07
seg "$NEW" 92.0 3   $(dur 08) "$XL,$(title 'PDF vs CSV - every value in its cell' $BG 40)" 08
seg "$NEW" 92.0 3   $(dur 13) "$DATES,$(title 'Tip - Excel may change dates' $BG '(w-tw)/2')" 08t
seg "$NEW" 102.5 0.034 $(dur 14) "$JUNK,$(title 'Multi-page PDFs - check page breaks' $BG 40)" 08l
S9=$(dur 09); S9A=3.8; S9B=$(python3 -c "print(round($S9-$S9A,2))")
seg "$SCAN" 36.0 4 $S9A "$SPANEL,$(title 'Scanned PDF - AI mode' $BG '(w-tw)/2')"       09
seg "$SCAN" 74.0 6 $S9B "$SXL,$(title 'Scan rebuilt as a table' $BG 40)"               10
seg "$SPDF" 15.5 7 $(dur 10) "$SMALL,$(title 'Smallpdf - pay to download' $RED 40)"     11
card  "Convert PDF to CSV" "Free on Chrome - devexthub.com" $(python3 -c "print(round($(vd 11)+2.0,2))") 12

: > concat.txt
for n in 00 01 02 03 04 05 05s 06 07 08 08t 08l 09 10 11 12; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
echo "=== time_base (должен быть один) ==="
for n in 00 01 02 03 04 05 05s 06 07 08 08t 08l 09 10 11 12; do ffprobe -v error -select_streams v -show_entries stream=time_base -of csv=p=0 seg_${n}.mp4; done | sort | uniq -c
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy pdf-anchor4-mute.mp4

# голос: 2.0с тишины под заставку, дальше каждый блок добит тишиной до длины своего сегмента (S9 = 2 сегмента)
python3 - <<'PY'
import subprocess
def d(f): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",f],capture_output=True,text=True).stdout)
segs=[(1,["01"]),(2,["02"]),(3,["03"]),(4,["04"]),(5,["05"]),(12,["05s"]),(6,["06"]),(7,["07"]),(8,["08"]),(13,["08t"]),(14,["08l"]),(9,["09","10"]),(10,["11"]),(11,["12"])]
args=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","lavfi","-t","2.0","-i","anullsrc=r=48000:cl=mono"]
fl="";lab=["[0:a]"]
for i,(v,ss) in enumerate(segs,1):
    args+=["-i",f"voices/v{v:02d}.wav"]
    L=sum(d(f"seg_{s}.mp4") for s in ss)
    fl+=f"[{i}:a]apad=whole_dur={L:.3f}[a{i}];";lab.append(f"[a{i}]")
fl+="".join(lab)+f"concat=n={len(lab)}:v=0:a=1[out]"
subprocess.run(args+["-filter_complex",fl,"-map","[out]","voice-full.wav"],check=True)
print("voice", round(d("voice-full.wav"),2), "video", round(d("pdf-anchor4-mute.mp4"),2))
PY

# финал: сабы (Groq по свежему voice-full, make_subs.py) + голос
ffmpeg -hide_banner -loglevel error -y -i voice-full.wav -ar 16000 -ac 1 -b:a 48k voice-full.mp3
curl -s https://api.groq.com/openai/v1/audio/transcriptions -H "Authorization: Bearer $(printenv GROQ_VOICE_API_KEY)" \
  -F file=@voice-full.mp3 -F model=whisper-large-v3 -F response_format=verbose_json \
  -F "timestamp_granularities[]=word" -F language=en > groq_words.json
python3 make_subs.py
ffmpeg -hide_banner -loglevel error -y -i pdf-anchor4-mute.mp4 -i voice-full.wav -filter_complex "
  [0:v]subtitles=subs.srt:force_style='FontName=DejaVu Sans,FontSize=20,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Alignment=2,MarginV=40'[v]" \
  -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k -shortest pdf-anchor4-final.mp4
echo "=== final ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-anchor4-final.mp4
