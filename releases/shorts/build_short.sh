#!/usr/bin/env bash
set -e
cd /home/client/workspace/tmp
IN=demo.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
OUT=/home/client/projects/Devexthub-site/releases/shorts/pdf-to-excel-short-v4.mp4
rm -f clip_*.mp4 concat.txt

# общая функция сборки клипа: START DUR CROP TOP BOTTOM BOTCOLOR N
mkclip () {
  local start=$1 dur=$2 crop=$3 top=$4 bottom=$5 botcol=$6 n=$7 maskh=${8:-0}
  local mask=""
  if [ "$maskh" -gt 0 ]; then mask="drawbox=x=0:y=300:w=1080:h=${maskh}:color=${BG}:t=fill,"; fi
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$IN" -an -vf "
    ${crop},
    scale=1000:1330:force_original_aspect_ratio=decrease,
    pad=1080:1920:(ow-iw)/2:300:color=${BG},
    ${mask}
    drawtext=fontfile=${F}:text='${top}':fontcolor=white:fontsize=60:box=1:boxcolor=black@0.5:boxborderw=20:x=(w-tw)/2:y=150,
    drawtext=fontfile=${F}:text='${bottom}':fontcolor=white:fontsize=52:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1650
  " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "clip_${n}.mp4"
}

#          START DUR  CROP                          TOP                         BOTTOM                     BOTCOL           N
mkclip  9.2  3.0  "crop=1010:580:20:8"          "Stuck copying a PDF table"  "Pick your PDF"            "black@0.5"      1
mkclip 13.0  2.6  "crop=440:850:1476:120"       "Drop it in the extension"   "then hit Convert"         "black@0.5"      2
mkclip 18.6  2.2  "crop=440:850:1476:120"       "Done in seconds"            "Download xlsx or csv"     "0x1E6F5C@0.9"   3
mkclip  4.6  2.4  "crop=708:768:44:16"          "Here is your PDF table"     "numbers, dates, totals"   "black@0.5"      4
mkclip 30.0  4.0  "crop=1040:900:880:70"        "Every number exact"         "No retyping. No upload"   "0x1E6F5C@0.9"   5  180
mkclip 34.0  2.6  "crop=1040:900:880:70"        "Convert PDF to Excel"       "free for Chrome"          "0x1E6F5C@0.95"  6  180

for n in 1 2 3 4 5 6; do echo "file 'clip_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy "$OUT"
echo "=== v4 готово ==="; ls -la "$OUT"
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT"
