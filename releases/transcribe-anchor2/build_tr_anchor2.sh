#!/usr/bin/env bash
# Якорный лонг Transcribe #2 «transcribe podcast».
# Источник: src/compressed_2026-09-03_11-29-32.mp4 (132.3с, 1920x1080, 30fps).
# Площадка в кадре: Apple Podcasts web, интерфейс английский (/us/ в пути URL).
# Таскбар Windows начинается на y=1032 (Яндекс, раскладка РУС) — режем по 1010.
set -e
cd /home/client/projects/Devexthub-site/releases/transcribe-anchor2
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x6B21A8
SRC=src/compressed_2026-09-03_11-29-32.mp4

# WIDE: всё окно Chrome с тулбаром (иконка расширения обязана быть в кадре), без таскбара.
wide () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1920:1010:0:0,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:34:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# MENU: выпадашка расширений вместе с иконкой-пазлом в тулбаре сверху.
menu () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=440:700:1300:66,scale=-2:930,
    pad=1920:1080:(ow-iw)/2:60:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PTOP: верх панели — название эпизода, кнопка Transcribe/Stop, язык.
ptop () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=456:520:1464:126,scale=-2:800,
    pad=1920:1080:(ow-iw)/2:150:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=40
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PTEXT: лента транскрипта — спикеры и таймкоды. Жёлтая плашка «Wrong language?» ОСТАЁТСЯ ВЫШЕ
# кропа: панель не прокручена, счётчик «N paragraphs» на y=542, текст ниже.
ptext () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=456:490:1464:520,scale=-2:860,
    pad=1920:1080:(ow-iw)/2:120:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=30
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PSCROLL: то же, но панель уже прокручена вниз (после 70с) — счётчик на y=300.
pscroll () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=456:520:1464:290,scale=-2:860,
    pad=1920:1080:(ow-iw)/2:120:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=30
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PEXP: низ панели — Copy / .doc (Word) / Export.
pexp () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=456:300:1464:600,scale=-2:640,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=60
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# WORD: готовый .doc. Режем шапку Word (имя «Денис Торопов») и русскую ленту с плашкой
# «ЗАЩИЩЕННЫЙ ПРОСМОТР» — начинаем с y=130, только сам документ.
word () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1030:800:436:130,scale=1040:-2,
    pad=1920:1080:(ow-iw)/2:12:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=856
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# карточка: T1 T2 DUR N  (эмблема продукта обязательна — договорённость 05.08)
card () {
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${BG}:s=1920x1080:d=$3:r=30" \
    -loop 1 -t "$3" -i icon.png \
    -filter_complex "
      [1:v]scale=180:180[ic];
      [0:v][ic]overlay=(W-w)/2:(H/2)-380[bg];
      [bg]drawtext=fontfile=${F}:text='$1':fontcolor=white:fontsize=88:x=(w-tw)/2:y=(h/2)-120,
          drawtext=fontfile=${FR}:text='$2':fontcolor=0xE9D5FF:fontsize=46:x=(w-tw)/2:y=(h/2)+20
    " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# Стартовая карточка несёт ПОЛНОЕ ИМЯ РАСШИРЕНИЯ, а не задачу (поправка Дениса 03.09):
# рядом с эмблемой «Transcribe a Podcast» читалось как название продукта, а искать по нему
# в сторе нечего. Задача ушла во вторую строку и в озвучку.
card  "Transcribe Video to Text" "Turn a podcast into text, free in Chrome"  2.0 00
wide   0.6  3.0 "An episode you need in text"            01
menu   3.6  1.6 "Click the extension in your toolbar"    02
ptop   6.6  2.8 "Press Transcribe, then play"            03
ptext   44.0  3.2 "The text is written as it plays"      04
pscroll 74.0  3.4 "Speakers and timestamps, automatic"   05
pexp  88.0  2.6 "Copy it, or export to Word"             06
word 100.5  4.6 "Your episode, as a document"            07
card  "Transcribe Video to Text" "Free on devexthub.com" 3.2 08

: > concat.txt
for n in 00 01 02 03 04 05 06 07 08; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy tr2-anchor-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 tr2-anchor-mute.mp4
