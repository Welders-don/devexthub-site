#!/usr/bin/env bash
# PDF-to-Excel лонг #3 (smallpdf alternative). Дуга: smallpdf грузит->конвертит->стена оплаты,
# наше расширение делает то же в браузере без пейволла.
# THEM = src/compressed_2026-09-07_11-15-51.mp4 (27.6s, футаж Дениса, smallpdf.com)
# OUR  = ../pdf-anchor2/src/compressed_2026-08-22_10-22-17.mp4 (наш демо на том же bank statement)
# Голос: voices/Puck.mp3 (26.69s), стартует после интро-карточки на 2.0с.
set -e
cd /home/client/projects/Devexthub-site/releases/pdf-anchor3
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
RED=0xB00020
THEM=src/compressed_2026-09-07_11-15-51.mp4
OUR=../pdf-anchor2/src/compressed_2026-08-22_10-22-17.mp4

# THEM: окно smallpdf целиком без таскбара. START DUR TITLE BOXCOLOR N
them () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$THEM" -an -vf "
    crop=1920:1013:0:0,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=$4@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# OUR wide: всё окно Chrome с иконкой расширения. START DUR TITLE N
owide () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$OUR" -an -vf "
    crop=1920:1020:0:0,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# OUR panel: сайдпанель расширения крупно. START DUR TITLE N
opanel () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$OUR" -an -vf "
    crop=460:900:1448:115,scale=-2:1000,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=30
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# OUR xl: лист Excel без ленты и таскбара. START DUR TITLE N
oxl () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$OUR" -an -vf "
    crop=1920:800:0:228,scale=1920:-2,
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

card  "PDF to Excel, Free"  "No paywall, no wait"                      2.0  00
them  2.0   2.3  "Upload it to Smallpdf"           "$BG"   01
them  8.0   2.2  "Convert to Excel"                "$BG"   02
them  15.0  2.2  "Done - now download it"          "$BG"   03
them  19.0  3.3  "Pay Pro or wait 12 hours"        "$RED"  04
owide 22.2  2.8  "Same PDF, right in Chrome"               05
opanel 26.6 1.6  "Drop it in - no upload"                  06
opanel 34.2 1.6  "One click"                               07
oxl   41.0  2.3  "53 rows, columns intact"                 08
oxl   72.0  2.2  "No account, no paywall"                  09
oxl   85.5  2.5  "Downloaded instantly"                    10
card  "Convert PDF to Excel"  "Free on devexthub.com"      4.0  11

: > concat.txt
for n in 00 01 02 03 04 05 06 07 08 09 10 11; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy pdf-anchor3-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-anchor3-mute.mp4
