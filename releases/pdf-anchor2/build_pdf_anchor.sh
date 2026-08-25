#!/usr/bin/env bash
# Якорный лонг PDF-to-Excel #2 (bank statement). Источник: src/compressed_2026-08-22_10-22-17.mp4 (90s).
# Тайминги выровнены по voice_raw.wav (Gemini Puck, 25.21с), голос стартует после карточки на 2.0с.
set -e
cd /home/client/projects/Devexthub-site/releases/pdf-anchor2
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
SRC=src/compressed_2026-08-22_10-22-17.mp4

# PDF: страница в PDF-XChange без таскбара и панели зума. START DUR TITLE N
pdf () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1860:880:40:110,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PANEL: сайдпанель расширения целиком, крупно. START DUR TITLE N
panel () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=460:900:1448:115,scale=-2:1000,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=30
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# XL: лист Excel без русской ленты сверху и таскбара снизу. START DUR TITLE N
xl () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1920:800:0:228,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# WIDE: всё окно Chrome с тулбаром (там иконка расширения) без таскбара. START DUR TITLE N
wide () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1920:1020:0:0,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# карточка: T1 T2 DUR N
card () {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${BG}:s=1920x1080:d=$3:r=30" \
    -loop 1 -t "$3" -i icon.png \
    -filter_complex "
      [1:v]scale=180:180[ic];
      [0:v][ic]overlay=(W-w)/2:(H/2)-380[bg];
      [bg]drawtext=fontfile=${F}:text='$1':fontcolor=white:fontsize=92:x=(w-tw)/2:y=(h/2)-120,
          drawtext=fontfile=${FR}:text='$2':fontcolor=0xD7F0E1:fontsize=46:x=(w-tw)/2:y=(h/2)+20
    " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

card  "Bank Statement to Excel" "Free Chrome extension, no retyping"  2.0 00
pdf   8.0   4.0 "Your statement is a locked PDF"        01
pdf   10.6  4.1 "Every row stuck inside the page"       02
wide  22.2  3.8 "Click the icon, the panel slides out"  03
panel 26.6  2.7 "Drop the PDF in"                       04
panel 34.2  2.7 "2 pages into 1 clean sheet"            05
xl    41.0  2.5 "53 rows, columns intact"               06
xl    72.0  1.8 "Same numbers, now editable"            07
xl    85.5  2.9 "Totals right where they belong"        08
card  "Convert PDF to Excel" "Free on devexthub.com"    3.2 09

: > concat.txt
for n in 00 01 02 03 04 05 06 07 08 09; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy pdf-anchor-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-anchor-mute.mp4
