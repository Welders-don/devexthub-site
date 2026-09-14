#!/usr/bin/env bash
# Якорный лонг Extract Text #3 «jpg to text free».
# Источник: src/compressed_2026-09-14_11-36-27.mp4 (82.2с, 1920x1080, 30fps).
# Нелинейная нарезка: попап пустой(26-29) + попап результат(30-35) + счёт(47-51) + сравнение notepad(72-80).
# Голос Kore 24.24с, стартует на 2.0с после стартовой карточки. Тайминги под фразы озвучки.
set -e
cd /home/client/projects/Devexthub-site/releases/et-anchor3
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
SRC=src/compressed_2026-09-14_11-36-27.mp4

# INVOICE: счёт крупно в просмотрщике (панель расширения справа отрезана, аватар отрезан).
inv () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1000:728:115:138,scale=-2:1000,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PUPE: попап расширения ПУСТОЙ — вкладка Upload File, Choose file, дроп-зона.
pupe () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=350:520:1398:110,scale=-2:940,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PUPR: попап с РЕЗУЛЬТАТОМ — весь текст счёта + Copy all / Download.
pupr () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=350:730:1398:110,scale=-2:960,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# CMP: сравнение — счёт слева, скачанный .txt в Notepad справа.
cmp () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1566:812:128:158,scale=1880:-2,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=24
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

card "JPG to Text, Free"        "Copy the words from any image"       2.0  00
inv  47.0  5.5 "The words are locked inside the JPG"  01
pupe 26.0  4.5 "Open it, pick Upload File"            02
pupr 30.5  5.0 "It reads every line, on your device"  03
cmp  72.5  7.0 "Copy it, or save a clean .txt"        04
card "Extract Text from Image"  "Free on Chrome - devexthub.com"     3.0  05

: > concat.txt
for n in 00 01 02 03 04 05; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy et-anchor3-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-anchor3-mute.mp4
