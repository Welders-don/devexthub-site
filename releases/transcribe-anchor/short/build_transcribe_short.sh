#!/usr/bin/env bash
# Вертикальный шорт Transcribe Video to Text (1080x1920).
# Источник: ../src/compressed_2026-08-16_14-25-10.mp4 (122s). Голос Gemini Puck 13.97s, сдвиг видео = голос + 0.4с.
set -e
cd /home/client/projects/Devexthub-site/releases/transcribe-anchor/short
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
SRC=../src/compressed_2026-08-16_14-25-10.mp4
ICON=../icon.png

# ПЛЕЕР: окно ролика на YouTube, зум 1.35x с обрезкой полей. START DUR L1 L2 N
player () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=913:515:32:203,scale=1460:-2,crop=1080:ih:190:0,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=80:x=(w-tw)/2:y=300,
    drawtext=fontfile=${F}:text='$4':fontcolor=0xFFD84D:fontsize=80:x=(w-tw)/2:y=1480
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# КОЛОНКА: правая лента длинных роликов (1:00:49 / 31:04 / 37:02). START DUR L1 L2 N
col () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=455:815:965:200,scale=-2:1420,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=78:x=(w-tw)/2:y=110,
    drawtext=fontfile=${F}:text='$4':fontcolor=0xFFD84D:fontsize=78:x=(w-tw)/2:y=1700
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# ВЕРХ ПАНЕЛИ: кнопка Transcribe крупно. START DUR TITLE N
ptop () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=445:400:1460:108,scale=1080:-2,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=84:x=(w-tw)/2:y=330
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# ПАНЕЛЬ ЦЕЛИКОМ: транскрипт с таймкодами. START DUR L1 L2 N
panel () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=445:910:1460:108,scale=-2:1480,
    pad=1080:1920:(ow-iw)/2:0:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=72:x=(w-tw)/2:y=1560,
    drawtext=fontfile=${F}:text='$4':fontcolor=0xFFD84D:fontsize=72:x=(w-tw)/2:y=1650
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$5.mp4"
}

# WORD: тело документа без риббона и имени владельца. START DUR TITLE N
word () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=880:830:545:135,scale=1080:-2,
    pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=80:x=(w-tw)/2:y=290,
    drawtext=fontfile=${FR}:text='Full tutorial on my channel':fontcolor=0xD7F0E1:fontsize=52:x=(w-tw)/2:y=1620
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# ЭНД-КАРТОЧКА: T1 T2 DUR N
card () {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${BG}:s=1080x1920:d=$3:r=30" \
    -loop 1 -t "$3" -i "$ICON" \
    -filter_complex "
      [1:v]scale=260:260[ic];
      [0:v][ic]overlay=(W-w)/2:(H/2)-420[bg];
      [bg]drawtext=fontfile=${F}:text='Transcribe':fontcolor=white:fontsize=104:x=(w-tw)/2:y=(h/2)-100,
          drawtext=fontfile=${F}:text='Video to Text':fontcolor=white:fontsize=104:x=(w-tw)/2:y=(h/2)+20,
          drawtext=fontfile=${FR}:text='$1':fontcolor=0xD7F0E1:fontsize=58:x=(w-tw)/2:y=(h/2)+200,
          drawtext=fontfile=${F}:text='$2':fontcolor=0xFFD84D:fontsize=64:x=(w-tw)/2:y=(h/2)+300
    " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# Тайминги выровнены по голосу Fenrir (groq_words_fenrir.json), сдвиг видео = слово + 0.4с.
col    1.5   2.20 "35 MINUTES EACH"   "NOBODY HAS TIME"  00
player 1.0   1.56 "SO DO NOT WATCH"   "READ IT INSTEAD"  01
ptop   4.0   1.28 "ONE CLICK"                            02
panel  16.0  2.50 "FULL TEXT"         "WITH TIMESTAMPS"  03
panel  53.0  2.38 "SWITCH THE"        "LANGUAGE"         04
word   108.6 1.98 "EXPORT TO WORD"                       05
card   "Free Chrome extension" "devexthub.com" 2.50      06

: > concat.txt
for n in 00 01 02 03 04 05 06; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy tr-short-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 tr-short-mute.mp4
