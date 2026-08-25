#!/usr/bin/env bash
# Якорный лонг Extract Text #2 «copy text from image».
# Источник: src/compressed_2026-08-25_12-37-20.mp4 (49.8с, 1920x1080, 30fps).
# Тайминги выровнены по voices/Kore.mp3 (22.21с, женский голос — выбор Дениса 25.08).
# Голос стартует после стартовой карточки, на 2.0с.
set -e
cd /home/client/projects/Devexthub-site/releases/et-anchor2
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
SRC=src/compressed_2026-08-25_12-37-20.mp4

# WIDE: всё окно Chrome с тулбаром (там иконка расширения), без таскбара.
# Таскбар начинается на y=1032 — там часы, дата и WeChat, режем по 1030.
wide () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1920:880:0:0,scale=1920:-2,
    pad=1920:1080:(ow-iw)/2:30:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# POPUP: попап расширения крупно, вместе с его иконкой в тулбаре сверху.
popup () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=760:560:1150:40,scale=-2:820,
    pad=1920:1080:(ow-iw)/2:40:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=30
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# PANEL: панель Extracted Text целиком, с кнопками Copy all / Download.
panel () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=500:460:1410:558,scale=-2:820,
    pad=1920:1080:(ow-iw)/2:40:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=30
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# RECOG: плашка «Recognizing text...» крупно. В общем плане она теряется в углу — проверено
# на первой сборке, титр был, а самой плашки зритель не видел. Низ режем по 1017: таскбар с 1032.
recog () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=560:195:1380:822,scale=-2:520,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=(w-tw)/2:y=140
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$4.mp4"
}

# NOTE: финальное сравнение — слайд слева, готовый .txt в блокноте справа.
note () {
  ffmpeg -hide_banner -loglevel error -y -ss "$1" -t "$2" -i "$SRC" -an -vf "
    crop=1420:660:500:270,scale=1800:-2,
    pad=1920:1080:(ow-iw)/2:40:color=black,
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

card  "Copy Text From an Image" "Free Chrome extension, no retyping" 2.0 00
wide   3.2  4.3 "The text is locked inside the image"  01
wide  10.2  2.3 "Click the extension in your toolbar"  02
popup 13.9  1.6 "Hit Start selection"                  03
wide  17.4  1.7 "Draw a box over the picture"          04
recog 21.9  3.1 "It reads right on your device"        05
panel 26.8  4.0 "Copy it, or download a .txt"          06
note  36.0  5.2 "Every line, every number"             07
card  "Extract Text from Image" "Free on devexthub.com" 3.2 08

: > concat.txt
for n in 00 01 02 03 04 05 06 07 08; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy et-anchor-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-anchor-mute.mp4
