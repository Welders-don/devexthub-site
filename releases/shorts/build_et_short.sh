#!/usr/bin/env bash
set -e
cd /home/client/workspace/tmp
IN=demo.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
OUT=et-recipe-short-v1-mute.mp4
rm -f clip_*.mp4 concat.txt

# START DUR CROP TOP BOTTOM BOTCOLOR N [maskh]
mkclip () {
  local start=$1 dur=$2 crop=$3 top=$4 bottom=$5 botcol=$6 n=$7 maskh=${8:-0}
  local mask=""
  if [ "$maskh" -gt 0 ]; then mask="drawbox=x=0:y=300:w=1080:h=${maskh}:color=${BG}:t=fill,"; fi
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$IN" -an -vf "
    ${crop},
    scale=1000:1330:force_original_aspect_ratio=decrease,
    pad=1080:1920:(ow-iw)/2:300:color=${BG},
    ${mask}
    drawtext=fontfile=${F}:text='${top}':fontcolor=white:fontsize=60:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-tw)/2:y=150,
    drawtext=fontfile=${F}:text='${bottom}':fontcolor=white:fontsize=50:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1300
  " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "clip_${n}.mp4"
}

#          START DUR  CROP                     TOP                         BOTTOM                        BOTCOL          N
mkclip 46.0 2.6 "crop=440:620:532:90"      "Text trapped in a photo?"  "A handwritten recipe"        "black@0.55"    1
mkclip 36.0 2.4 "crop=340:430:1300:160"    "Open Extract Text"         "drop, paste or screenshot"   "black@0.55"    2
mkclip 95.0 3.0 "crop=500:380:860:268"     "One click"                 "Clean, editable text"        "0x1E6F5C@0.9"  3
mkclip 95.0 3.2 "crop=1200:615:400:205"    "Photo to text in seconds"  "Extract Text  free on Chrome" "0x1E6F5C@0.95" 4

for n in 1 2 3 4; do echo "file 'clip_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy "$OUT"
echo "=== mute готово ==="; ls -la "$OUT"
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT"