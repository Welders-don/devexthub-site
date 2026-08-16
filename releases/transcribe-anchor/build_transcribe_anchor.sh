#!/usr/bin/env bash
# Якорный лонг Transcribe Video to Text. Источник: src/compressed_2026-08-16_14-25-10.mp4 (122s).
# Тайминги выровнены по голосу (voice.wav, Gemini Puck), сдвиг видео = голос + 0.4с.
set -e
cd /home/client/projects/Devexthub-site/releases/transcribe-anchor
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
SRC=src/compressed_2026-08-16_14-25-10.mp4

# WIDE: весь экран без адресной строки и таскбара. START DUR TITLE N
wide () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1920:965:0:60,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=44:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PANEL_TOP: кнопка + селект языка + счётчик, крупно. START DUR TITLE N
ptop () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=460:330:1455:110,scale=-2:760,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=52:x=(w-tw)/2:y=60
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PANEL_TEXT: область транскрипта, крупно. START DUR TITLE N
ptext () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=460:430:1455:390,scale=-2:900,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=52:x=(w-tw)/2:y=44
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# WORD: страница документа без риббона (там русский UI и имя). START DUR TITLE N
word () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1120:760:310:240,scale=-2:1000,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}:boxborderw=14:x=(w-tw)/2:y=18
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PBTN: кнопки экспорта (Copy / формат / Export), крупно. START DUR TITLE N
pbtn () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=470:230:1450:800,scale=-2:640,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=56:x=(w-tw)/2:y=150
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

card  "Transcribe Video to Text" "Any video into text, right in your browser" 2.0 00
wide  1.0  2.8 "A 35 minute tutorial"              01
ptop  4.0  4.1 "One click in the side panel"       02
ptext 16.0 3.9 "Full transcript, with timestamps"  03
ptop  26.6 2.2 "Now switch the language"           04
ptext 40.5 1.7 "Spanish"                           05
ptext 53.0 1.6 "Japanese"                          06
ptext 33.0 1.6 "Portuguese"                        07
pbtn  66.0 2.8 "Export as Word, TXT or SRT"             08
word  108.6 4.6 "37,000 characters of study notes" 09
ptop  0.2  3.3 "YouTube transcripts stay unlimited"    10
card  "Transcribe Video to Text" "Free on devexthub.com" 3.3 11

: > concat.txt
for n in 00 01 02 03 04 05 06 07 08 09 10 11; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy tr-anchor-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 tr-anchor-mute.mp4
