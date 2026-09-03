#!/usr/bin/env bash
# Transcribe шорт заход №2 — угол «результат-первым»: готовый .doc со спикерами и таймкодами.
# Рецепт залетевшего PDF-шорта: крупные drawtext + энергичный голос, караоке-сабов НЕТ.
set -e
cd "$(dirname "$0")"
IN=../src/compressed_2026-09-03_11-29-32.mp4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x1A0B2E
PU=0x6B21A8
rm -f seg_*.mp4 concat.txt
# ЧИТАЕМОСТЬ В ВЕРТИКАЛИ: текст Word в кадре мелкий (страница 1030px растягивается до 1080,
# увеличения почти нет), тугая полоса не спасает — режет строки. Поэтому ЧИТАЕМЫЙ текст берём
# из САЙДПАНЕЛИ (там шрифт крупный), а Word-страницу показываем целиком как ОБРАЗ документа,
# читать её зритель не должен.

# ХВОСТ ТИШИНЫ. Голос Fenrir 12.81с + adelay 0.3 = кончается на 13.11с. Видео должно быть
# ~14.6с, иначе после последнего слова ролик идёт молча 4 секунды (поймал Денис 03.09).
# Правило: после конца озвучки оставлять не больше ~1.5с — ровно на энд-карточку.

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

# энд-карточка: эмблема продукта + Free on Chrome + адрес лендинга (правило для ЛЮБОГО ролика)
endcard () {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${PU}:s=1080x1920:d=$1:r=30" \
    -loop 1 -t "$1" -i ../icon.png \
    -filter_complex "
      [1:v]scale=220:220[ic];
      [0:v][ic]overlay=(W-w)/2:(H/2)-330[bg];
      [bg]drawtext=fontfile=${F}:text='Transcribe Video to Text':fontcolor=white:fontsize=62:x=(w-tw)/2:y=(h/2)-60,
          drawtext=fontfile=${FR}:text='Free on Chrome':fontcolor=0xE9D5FF:fontsize=52:x=(w-tw)/2:y=(h/2)+40,
          drawtext=fontfile=${FR}:text='devexthub.com':fontcolor=0xE9D5FF:fontsize=48:x=(w-tw)/2:y=(h/2)+130
    " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "seg_$2.mp4"
}

#      START  DUR   CROP                      TOP                            BOTTOM                          BOTCOL      N
mkclip  90.0  2.20  "crop=456:600:1464:380"   "Every word of the podcast"    "speakers and timestamps"       "${PU}@0.9" 0
mkclip   6.8  1.60  "crop=456:420:1464:126"   "One click in your browser"    ""                              ""          1
mkclip   9.6  1.40  "crop=456:400:1464:200"   "Press Transcribe"             ""                              ""          2
mkclip  45.0  2.20  "crop=456:490:1464:520"   "It writes as the episode plays" ""                            ""          3
mkclip  76.0  1.80  "crop=456:520:1464:290"   "Who said what, and when"      ""                              ""          4
mkclip  89.0  1.60  "crop=456:300:1464:600"   "Export to Word"               ""                              ""          5
mkclip 104.0  2.00  "crop=1030:800:436:130"   "Your episode, as a document"  "Full tutorial on my channel ->" "${PU}@0.9" 6
endcard 1.80 7

for n in 0 1 2 3 4 5 6 7; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy tr-short-mute.mp4

VDUR=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 tr-short-mute.mp4)
echo "=== mute ${VDUR} ==="
