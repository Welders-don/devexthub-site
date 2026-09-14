#!/bin/bash
# Демо-JPG для ET-лонга #3, ключ "jpg to text free".
# Флоу в ролике — Upload File: перетащить ЭТОТ jpg в дроп-зону расширения.
# Вид — сфотканный/сканированный счёт: естественно для .jpg + много цифр,
# на которых OCR наглядно блеснёт (как строки-цифры блеснули в заходе #2).
# PIL/ImageMagick на машине НЕТ — рисуем ffmpeg drawtext поверх заливки.
# Перегенерить: bash gen_jpg.sh [out.jpg]
set -e
S=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
B=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
OUT=${1:-demo-invoice.jpg}

t() { # text x y size color font
  # ГРАБЛЯ (из #2): в drawtext ':' режет опции, ',' режет фильтры — экранировать оба.
  local esc
  esc=$(printf '%s' "$1" | sed -e 's/:/\\:/g' -e 's/,/\\,/g')
  echo -n "drawtext=fontfile=$6:text='$esc':x=$2:y=$3:fontsize=$4:fontcolor=$5,"
}

FILTER=""
FILTER+=$(t "NORTHGATE SUPPLIES" 90 70 52 0x1a1a1a $B)
FILTER+=$(t "INVOICE #2026-0417" 90 135 30 0x555555 $S)
FILTER+="drawbox=x=90:y=185:w=1100:h=4:color=0x1a5fb4:t=fill,"
FILTER+=$(t "Bill to: Harborview Cafe" 90 220 30 0x2b2b2b $S)
FILTER+=$(t "Date: March 14, 2026" 90 262 30 0x2b2b2b $S)
FILTER+=$(t "Espresso beans, 5 kg" 130 350 32 0x2b2b2b $S)
FILTER+=$(t "148.00" 950 350 32 0x2b2b2b $S)
FILTER+=$(t "Oat milk, 24 cartons" 130 404 32 0x2b2b2b $S)
FILTER+=$(t "86.40" 950 404 32 0x2b2b2b $S)
FILTER+=$(t "Paper cups, 1000 count" 130 458 32 0x2b2b2b $S)
FILTER+=$(t "52.75" 950 458 32 0x2b2b2b $S)
FILTER+="drawbox=x=130:y=520:w=1060:h=3:color=0xbbbbbb:t=fill,"
FILTER+=$(t "Subtotal" 130 545 32 0x2b2b2b $S)
FILTER+=$(t "287.15" 950 545 32 0x2b2b2b $S)
FILTER+=$(t "Tax 8 percent" 130 597 32 0x2b2b2b $S)
FILTER+=$(t "22.97" 950 597 32 0x2b2b2b $S)
FILTER+=$(t "TOTAL DUE" 130 655 36 0x1a1a1a $B)
FILTER+=$(t "310.12" 950 655 36 0x1a1a1a $B)
FILTER+=$(t "Payment due within 30 days" 90 730 26 0x777777 $S)
FILTER="${FILTER%,}"

# Лёгкий тёплый фон «бумаги», кодируем в JPG высокого качества.
ffmpeg -y -v error -f lavfi -i "color=c=0xf6f4ef:s=1280x820" \
  -vf "$FILTER" -frames:v 1 -q:v 2 "$OUT"
echo "written: $OUT"
