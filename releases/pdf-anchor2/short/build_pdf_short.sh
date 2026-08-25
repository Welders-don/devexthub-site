#!/usr/bin/env bash
# Вертикальный шорт PDF-to-Excel «Bank statement» (1080x1920).
# Источник: ../src/compressed_2026-08-22_10-22-17.mp4 (90s). Голос Gemini Fenrir 11.25с, сдвиг видео = голос + 0.4с.
# Рецепт победителя: крупные drawtext сверху/снизу, БЕЗ караоке-сабов.
set -e
cd /home/client/projects/Devexthub-site/releases/pdf-anchor2/short
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
SRC=../src/compressed_2026-08-22_10-22-17.mp4
ICON=../icon.png

# PDF: строки выписки во всю ширину страницы. START DUR L1 L2 N
pdf () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1600:850:170:120,scale=1080:-2,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=80:x=(w-tw)/2:y=380,
    drawtext=fontfile=${F}:text='$4':fontcolor=0xFFD84D:fontsize=80:x=(w-tw)/2:y=1420
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# ICON: правая часть окна — тулбар с иконкой расширения и выезжающая панель. START DUR L1 L2 N
iconbar () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=800:1020:1120:0,scale=1080:-2,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=74:x=(w-tw)/2:y=110,
    drawtext=fontfile=${F}:text='$4':fontcolor=0xFFD84D:fontsize=74:x=(w-tw)/2:y=1720
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# PANEL: сайдпанель целиком. START DUR L1 L2 N
panel () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=460:900:1448:115,scale=-2:1450,
    pad=1080:1920:(ow-iw)/2:120:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=76:x=(w-tw)/2:y=1640,
    drawtext=fontfile=${F}:text='$4':fontcolor=0xFFD84D:fontsize=76:x=(w-tw)/2:y=1740
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# XL: лист Excel, левая часть с датами и описаниями. START DUR L1 L2 N
xl () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1460:800:20:228,scale=1080:-2,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=80:x=(w-tw)/2:y=300,
    drawtext=fontfile=${F}:text='$4':fontcolor=0xFFD84D:fontsize=80:x=(w-tw)/2:y=1500
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# ЭНД-КАРТОЧКА: T1 T2 DUR N
card () {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${BG}:s=1080x1920:d=$3:r=30" \
    -loop 1 -t "$3" -i "$ICON" \
    -filter_complex "
      [1:v]scale=260:260[ic];
      [0:v][ic]overlay=(W-w)/2:(H/2)-420[bg];
      [bg]drawtext=fontfile=${F}:text='Convert PDF':fontcolor=white:fontsize=104:x=(w-tw)/2:y=(h/2)-100,
          drawtext=fontfile=${F}:text='to Excel':fontcolor=white:fontsize=104:x=(w-tw)/2:y=(h/2)+20,
          drawtext=fontfile=${FR}:text='$1':fontcolor=0xD7F0E1:fontsize=58:x=(w-tw)/2:y=(h/2)+200,
          drawtext=fontfile=${F}:text='$2':fontcolor=0xFFD84D:fontsize=64:x=(w-tw)/2:y=(h/2)+300
    " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

pdf     9.5   3.6  "YOUR BANK STATEMENT"  "LOCKED IN A PDF"     00
iconbar 22.4  2.0  "CLICK THE ICON"       "PANEL SLIDES OUT"    01
panel   27.5  1.1  "DROP THE PDF IN"      ""                    02
panel   34.5  2.5  "2 PAGES, 1 SHEET"     "53 ROWS"             03
xl      46.0  1.7  "EVERY TRANSACTION"    "EXCEL OR CSV"        04
card    "Free Chrome extension" "devexthub.com" 2.2             05

: > concat.txt
for n in 00 01 02 03 04 05; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy pdf-short-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-short-mute.mp4
