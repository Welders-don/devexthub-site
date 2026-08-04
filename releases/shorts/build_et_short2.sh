#!/usr/bin/env bash
set -e
cd /home/client/workspace/tmp
IN=demo2.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
OUT=et-paste-short-v2-mute.mp4
rm -f clip_*.mp4 concat.txt

mkclip () {
  local start=$1 dur=$2 crop=$3 top=$4 bottom=$5 botcol=$6 n=$7
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$IN" -an -vf "
    ${crop},
    scale=1000:1330:force_original_aspect_ratio=decrease,
    pad=1080:1920:(ow-iw)/2:300:color=${BG},
    drawtext=fontfile=${F}:text='${top}':fontcolor=white:fontsize=60:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-tw)/2:y=150,
    drawtext=fontfile=${F}:text='${bottom}':fontcolor=white:fontsize=50:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1650
  " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "clip_${n}.mp4"
}

#          START DUR  CROP                       TOP                        BOTTOM                          BOTCOL          N
mkclip 15.0 3.0 "crop=720:470:1160:295"      "Text stuck in an image?"  "You cannot select it"          "black@0.55"    1
mkclip 17.0 2.6 "crop=760:560:620:70"        "Copy the image"           "one shortcut"                  "black@0.55"    2
mkclip 24.0 3.0 "crop=360:520:1275:305"      "Paste into Extract Text"  "Ctrl + V"                      "0x1E6F5C@0.9"  3
mkclip 26.0 3.2 "crop=350:250:1285:468"       "Copy, paste, done"        "Extract Text  free on Chrome"  "0x1E6F5C@0.95" 4

for n in 1 2 3 4; do echo "file 'clip_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy "$OUT"
echo "=== v2 mute готово ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT"