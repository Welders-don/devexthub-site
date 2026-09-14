#!/usr/bin/env bash
# ET шорт заход №3 — угол «jpg to text free» (флоу Upload File).
# Рецепт залетевшего PDF-шорта: крупные drawtext сверху/снизу + голос Fenrir, караоке-сабов НЕТ.
set -e
cd "$(dirname "$0")"
IN=../src/compressed_2026-09-14_11-36-27.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
GR=0x1E6F5C
rm -f seg_*.mp4 concat.txt

# drawtext молча ест текст на : , % ' — экранируем в хелпере
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

#      START  DUR   CROP                      TOP                         BOTTOM                  BOTCOL       N
mkclip 47.5   3.0   "crop=1000:720:115:140"   "The words are in a JPG"    "you cannot select it"  "black@0.55" 0
mkclip 26.5   2.0   "crop=350:520:1398:110"   "Open Extract Text"         "hit Upload File"       "${GR}@0.9"  1
mkclip 27.8   1.8   "crop=350:520:1398:110"   "Pick your JPG"             ""                      ""           2
mkclip 31.0   2.8   "crop=350:730:1398:110"   "Every line, real text"     "Copy all or Download"  "${GR}@0.9"  3
mkclip 74.0   2.4   "crop=740:440:952:232"    "A clean .txt file"         ""                      ""           4
mkclip 33.0   2.0   "crop=350:730:1398:110"   "Extract Text from Image"   "Free for Chrome"       "${GR}@0.95" 5

for n in 0 1 2 3 4 5; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy et-short3-mute.mp4

VDUR=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-short3-mute.mp4)
# apad + -t по длине ВИДЕО: -shortest режет видео по голосу и съедает финальный план
ffmpeg -hide_banner -loglevel error -y -i et-short3-mute.mp4 -i voice.wav \
  -filter_complex "[1:a]apad[a]" -map 0:v -map "[a]" -t "$VDUR" \
  -c:v copy -c:a aac -b:a 160k et-short3-final.mp4

echo "=== готово ==="; ls -la et-short3-final.mp4
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-short3-final.mp4
