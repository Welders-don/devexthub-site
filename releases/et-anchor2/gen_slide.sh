#!/bin/bash
# Демо-картинка для ET-лонга #2: слайд с текстом, который нельзя выделить мышью.
# PIL/ImageMagick на машине НЕТ — рисуем ffmpeg drawtext поверх заливки.
# Перегенерить: bash gen_slide.sh
set -e
S=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
B=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
OUT=${1:-slide-demo.png}

t() { # text x y size color font
  # ГРАБЛЯ: в drawtext ':' режет опции, ',' режет фильтры — экранировать оба, иначе строка
  # молча обрежется по первому вхождению (потерял «: 41 hours» и «: internal ops» на 1-м прогоне).
  local esc
  esc=$(printf '%s' "$1" | sed -e 's/:/\\:/g' -e 's/,/\\,/g')
  echo -n "drawtext=fontfile=$6:text='$esc':x=$2:y=$3:fontsize=$4:fontcolor=$5,"
}

FILTER=""
FILTER+=$(t "Q3 LOGISTICS REVIEW" 90 80 54 0x1a1a1a $B)
FILTER+="drawbox=x=90:y=155:w=250:h=5:color=0x1a7d3a:t=fill,"
FILTER+=$(t "Warehouse throughput up 18 percent after the" 90 220 36 0x2b2b2b $S)
FILTER+=$(t "new picking route rolled out in May." 90 272 36 0x2b2b2b $S)
FILTER+=$(t "Average order cycle time: 41 hours" 130 360 34 0x2b2b2b $S)
FILTER+=$(t "Returns processed same day: 92 percent" 130 412 34 0x2b2b2b $S)
FILTER+=$(t "Damaged in transit: 0.7 percent of volume" 130 464 34 0x2b2b2b $S)
FILTER+=$(t "Two sites still run the old scanner firmware" 130 516 34 0x2b2b2b $S)
FILTER+=$(t "Source: internal ops dashboard, week 39" 90 620 26 0x777777 $S)
FILTER="${FILTER%,}"

ffmpeg -y -v error -f lavfi -i "color=c=0xf4f2ed:s=1280x720" \
  -vf "$FILTER" -frames:v 1 "$OUT"
echo "written: $OUT"
