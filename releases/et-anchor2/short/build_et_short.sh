#!/usr/bin/env bash
# ET шорт заход №2 — угол «обвод области прямо на странице»
# Рецепт залетевшего PDF-шорта (releases/shorts/build_short.sh): крупные drawtext + голос, сабов НЕТ
set -e
cd "$(dirname "$0")"
IN=../src/compressed_2026-08-25_12-37-20.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
GR=0x1E6F5C
rm -f seg_*.mp4 concat.txt

# drawtext молча ест текст на : , % ' — экранируем в хелпере, а не руками в фильтре
esc () { printf '%s' "$1" | sed -e "s/\\\\/\\\\\\\\/g" -e "s/:/\\\\:/g" -e "s/,/\\\\,/g" -e "s/'/\\\\\\\\\\\\'/g" -e "s/%/\\\\%/g"; }

# START DUR CROP TOP BOTTOM BOTCOLOR N
mkclip () {
  local start=$1 dur=$2 crop=$3 top=$4 bottom=$5 botcol=$6 n=$7
  local dt="drawtext=fontfile=${F}:text='$(esc "$top")':fontcolor=white:fontsize=60:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-tw)/2:y=150"
  if [ -n "$bottom" ]; then
    dt="${dt},drawtext=fontfile=${F}:text='$(esc "$bottom")':fontcolor=white:fontsize=52:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1650"
  fi
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$IN" -an -vf "
    ${crop},
    scale=1080:1200:force_original_aspect_ratio=decrease,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    ${dt}
  " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "seg_${n}.mp4"
}

#      START  DUR   CROP                        TOP                        BOTTOM                  BOTCOL       N
mkclip  3.75  3.90  "crop=620:530:570:465"      "This text is an IMAGE"    "you cannot select it"  "black@0.55" 0
mkclip 10.60  2.20  "crop=440:470:1390:100"     "Extract Text from Image"  "free Chrome extension" "${GR}@0.9"  1
mkclip 13.60  1.25  "crop=440:360:1385:80"      "Hit Start selection"      ""                     ""           2
mkclip 18.40  1.25  "crop=920:800:500:215"      "Drag a box around it"     ""                     ""           3
mkclip 21.80  0.95  "crop=520:180:1400:850"     "Two seconds"              ""                     ""           4
mkclip 25.80  2.15  "crop=500:460:1410:558"     "Every line exact"         "Copy all or Download"  "${GR}@0.9"  5
mkclip 36.00  1.50  "crop=1420:660:500:270"     "From image to real text"  ""                     ""           6
mkclip 38.00  1.80  "crop=800:300:1080:490"     "Extract Text from Image"  "Free for Chrome"       "${GR}@0.95" 7

for n in 0 1 2 3 4 5 6 7; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy et-short-mute.mp4

VDUR=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-short-mute.mp4)
# apad + -t по длине ВИДЕО: -shortest режет видео по голосу и съедает финальный план
ffmpeg -hide_banner -loglevel error -y -i et-short-mute.mp4 -i voice.wav \
  -filter_complex "[1:a]apad[a]" -map 0:v -map "[a]" -t "$VDUR" \
  -c:v copy -c:a aac -b:a 160k et-short-final.mp4

echo "=== готово ==="; ls -la et-short-final.mp4
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-short-final.mp4
