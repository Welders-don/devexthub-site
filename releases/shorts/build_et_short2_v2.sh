#!/usr/bin/env bash
# ET paste short v2 — cohesive fill. Тайминги = как в v1 (голос синхронен).
set -e
cd /home/client/workspace/tmp
IN=demo2.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
OUT=et-paste-short-v2b-mute.mp4
DRAFT=${DRAFT:-0}
rm -f clip_*.mp4 concat.txt

mkclip () {
  local start=$1 dur=$2 crop=$3 top=$4 bottom=$5 botcol=$6 n=$7 mask=${8:-}
  local m=""; [ -n "$mask" ] && m="${mask},"
  local enc="-preset medium -crf 20"
  [ "$DRAFT" = 1 ] && enc="-preset ultrafast -crf 28"
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$IN" -an -vf "
    ${crop},
    scale=1080:1920:force_original_aspect_ratio=decrease,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    ${m}
    drawtext=fontfile=${F}:text='${top}':fontcolor=white:fontsize=58:box=1:boxcolor=black@0.6:boxborderw=20:x=(w-tw)/2:y=120,
    drawtext=fontfile=${F}:text='${bottom}':fontcolor=white:fontsize=50:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1300
  " -r 30 -c:v libx264 $enc -pix_fmt yuv420p "clip_${n}.mp4"
}

#          START DUR  CROP                    TOP                        BOTTOM                          BOTCOL          N
mkclip 15.0 3.0 "crop=560:770:150:65"      "Text stuck in an image?"  "You cannot select it"          "black@0.6"     1
mkclip 17.0 2.6 "crop=500:770:1180:55"     "Copy the image"           "one shortcut"                  "black@0.6"     2
mkclip 24.0 3.0 "crop=500:730:1175:30"     "Paste into Extract Text"  "Ctrl + V"                      "0x1E6F5C@0.9"  3
mkclip 24.0 3.2 "crop=450:540:1180:300"    "Copy, paste, done"        "Extract Text  free on Chrome"  "0x1E6F5C@0.95" 4

for n in 1 2 3 4; do echo "file 'clip_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy "$OUT"
echo "=== paste v2 mute готово ($OUT) ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT"
