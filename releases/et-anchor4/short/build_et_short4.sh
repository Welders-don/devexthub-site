#!/usr/bin/env bash
# ET шорт заход №4 «copy text from picture»: два способа (рамка на странице + Upload File).
# Рецепт шортов: крупные drawtext сверху/снизу + голос Fenrir, караоке-сабов НЕТ.
# Кропы из et-anchor2/short и et-anchor3/short, не подбирались заново.
set -e
cd "$(dirname "$0")"
A=../../et-anchor2/src/compressed_2026-08-25_12-37-20.mp4
B=../../et-anchor3/src/compressed_2026-09-14_11-36-27.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0B1220
GR=0x1E6F5C

esc () { printf '%s' "$1" | sed -e "s/\\\\/\\\\\\\\/g" -e "s/:/\\\\:/g" -e "s/,/\\\\,/g" -e "s/'/\\\\\\\\\\\\'/g" -e "s/%/\\\\%/g"; }

# SRC START DUR CROP TOP BOTTOM BOTCOLOR N
mkclip () {
  local in=$1 start=$2 dur=$3 crop=$4 top=$5 bottom=$6 botcol=$7 n=$8
  local dt="drawtext=fontfile=${F}:text='$(esc "$top")':fontcolor=white:fontsize=60:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-tw)/2:y=150"
  if [ -n "$bottom" ]; then
    dt="${dt},drawtext=fontfile=${F}:text='$(esc "$bottom")':fontcolor=white:fontsize=52:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1650"
  fi
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$in" -an -vf "
    ${crop},
    scale=1080:1200:force_original_aspect_ratio=decrease,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    ${dt}
  " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 "seg_${n}.mp4"
}

# концовка: иконка + название + Free on Chrome - devexthub.com, фон 0x0F6B39
endcard () {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=0x0F6B39:s=1080x1920:d=$1:r=30" -loop 1 -t "$1" -i icon.png \
    -filter_complex "[1:v]scale=220:220[ic];[0:v][ic]overlay=(W-w)/2:(H/2)-420[bg];
      [bg]drawtext=fontfile=${F}:text='Extract Text from Image':fontcolor=white:fontsize=70:x=(w-tw)/2:y=(h/2)-120,
          drawtext=fontfile=${FR}:text='Free on Chrome - devexthub.com':fontcolor=0xD7F0E1:fontsize=48:x=(w-tw)/2:y=(h/2)+10" \
    -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$2.mp4"
}

#      SRC  START  DUR   CROP                     TOP                          BOTTOM                  BOTCOL       N
mkclip "$A"  3.75  2.30  "crop=620:530:570:465"   "Text in a picture?"         "you cannot select it"  "black@0.55" 0
mkclip "$A" 18.40  1.50  "crop=920:800:500:215"   "Way 1 - draw a box"         ""                      ""           1
mkclip "$B" 26.50  1.60  "crop=350:520:1398:110"  "Way 2 - upload the file"    ""                      ""           2
mkclip "$B" 31.00  2.10  "crop=350:730:1398:110"  "Every line, real text"      "on your device"        "${GR}@0.9"  3
mkclip "$A" 25.80  1.40  "crop=500:460:1410:558"  "Copy all or Download"       ""                      ""           4
endcard 2.5 5

: > concat.txt
for n in 0 1 2 3 4 5; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
for n in 0 1 2 3 4 5; do ffprobe -v error -select_streams v -show_entries stream=time_base -of csv=p=0 seg_${n}.mp4; done | sort | uniq -c
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy et-short4-mute.mp4

VDUR=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-short4-mute.mp4)
ffmpeg -hide_banner -loglevel error -y -i et-short4-mute.mp4 -i voice.wav \
  -filter_complex "[1:a]adelay=300|300,apad[a]" -map 0:v -map "[a]" -t "$VDUR" \
  -c:v copy -c:a aac -b:a 160k et-short4-final.mp4
echo "=== готово ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-short4-final.mp4
