#!/usr/bin/env bash
# ET recipe short v2 — cohesive fill: tall-кроп по месту действия, контент заполняет кадр,
# текст top y=120 / bottom y=1300 (safe-zone TikTok UI). Тайминги = как в v1 (голос синхронен).
set -e
cd /home/client/workspace/tmp
IN=demo.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
OUT=et-recipe-short-v2-mute.mp4
DRAFT=${DRAFT:-0}
rm -f clip_*.mp4 concat.txt

# START DUR CROP TOP BOTTOM BOTCOLOR N [maskspec]
mkclip () {
  local start=$1 dur=$2 crop=$3 top=$4 bottom=$5 botcol=$6 n=$7 mask=${8:-}
  local m=""; [ -n "$mask" ] && m="${mask},"
  local enc="-preset medium -crf 20"; local sc="scale=1080:1920:force_original_aspect_ratio=decrease"
  [ "$DRAFT" = 1 ] && { enc="-preset ultrafast -crf 28"; }
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$IN" -an -vf "
    ${crop},
    ${sc},
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    ${m}
    drawtext=fontfile=${F}:text='${top}':fontcolor=white:fontsize=58:box=1:boxcolor=black@0.6:boxborderw=20:x=(w-tw)/2:y=120,
    drawtext=fontfile=${F}:text='${bottom}':fontcolor=white:fontsize=50:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1300
  " -r 30 -c:v libx264 $enc -pix_fmt yuv420p "clip_${n}.mp4"
}

#          START DUR  CROP                    TOP                        BOTTOM                        BOTCOL          N   MASK
mkclip 46.0 2.6 "crop=480:640:495:90"      "Text trapped in a photo?"  "A handwritten recipe"        "black@0.6"     1
mkclip 36.0 2.4 "crop=340:430:1256:65"     "Open Extract Text"         "drop, paste or screenshot"   "black@0.6"     2
mkclip 95.0 3.0 "crop=430:660:860:190"     "One click"                 "Clean, editable text"        "0x1E6F5C@0.9"  3
mkclip 95.0 3.2 "crop=520:620:338:200"     "Photo to text in seconds"  "Extract Text  free on Chrome" "0x1E6F5C@0.95" 4

for n in 1 2 3 4; do echo "file 'clip_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy "$OUT"
echo "=== recipe v2 mute готово ($OUT) ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT"
