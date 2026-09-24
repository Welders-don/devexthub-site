#!/usr/bin/env bash
# ET-лонг #4 «copy text from picture»: два способа из готовых футажей Дениса.
# A = ../et-anchor2/src (25.08, картинка на веб-странице, Start selection)
# B = ../et-anchor3/src (14.09, jpg с компьютера, Upload File)
# Кропы взяты из build_et_anchor.sh (#2) и build_et_anchor3.sh (#3), не подбирались заново.
# Голос voices/Kore.mp3 (22.49с) с 2.0с, сегменты выровнены по groq_words.json.
set -e
cd /home/client/projects/Devexthub-site/releases/et-anchor4
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0F6B39
A=../et-anchor2/src/compressed_2026-08-25_12-37-20.mp4
B=../et-anchor3/src/compressed_2026-09-14_11-36-27.mp4

# SRC START DUR CROP+SCALE+PAD TITLE TITLE_X N
seg () {
  ffmpeg -hide_banner -loglevel error -y -ss "$2" -t "$3" -i "$1" -an -vf "
    $4,
    drawtext=fontfile=${F}:text='$5':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=$6:y=24
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_$7.mp4"
}
WIDE="crop=1920:880:0:0,scale=1920:-2,pad=1920:1080:(ow-iw)/2:30:color=black"
POPUP="crop=760:560:1150:40,scale=-2:820,pad=1920:1080:(ow-iw)/2:40:color=black"
RECOG="crop=560:195:1380:822,scale=-2:520,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black"
PANEL="crop=500:460:1410:558,scale=-2:820,pad=1920:1080:(ow-iw)/2:40:color=black"
PUPE="crop=350:520:1398:110,scale=-2:940,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black"
PUPR="crop=350:730:1398:110,scale=-2:960,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black"
CMP="crop=1566:812:128:158,scale=1880:-2,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black"

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

card "Copy Text From a Picture" "Two free ways in Chrome"                  2.0 00
seg "$A"  3.2 4.2 "$WIDE"  "Text in a picture cannot be selected" 40        01
seg "$A"  9.0 3.3 "$WIDE"  "Way 1 - picture on a web page"        40        02
seg "$A" 13.9 1.4 "$POPUP" "Hit Start selection"                  "(w-tw)/2" 03
seg "$A" 17.4 1.8 "$WIDE"  "Draw a box around it"                 40        04
seg "$B" 26.0 4.1 "$PUPE"  "Way 2 - a file on your computer"      "(w-tw)/2" 05
seg "$A" 21.9 1.5 "$RECOG" "Reads it on your device"              "(w-tw)/2" 06
seg "$B" 30.5 1.6 "$PUPR"  "Every line, no upload"                "(w-tw)/2" 07
seg "$A" 26.8 2.5 "$PANEL" "Copy it, or save a .txt"              "(w-tw)/2" 08
seg "$B" 72.5 2.3 "$CMP"   "Free, in Chrome"                      "(w-tw)/2" 09
card "Extract Text from Image" "Free on Chrome - devexthub.com"            3.0 10

: > concat.txt
for n in 00 01 02 03 04 05 06 07 08 09 10; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
echo "=== time_base по сегментам (должен быть один) ==="
for n in 00 01 02 03 04 05 06 07 08 09 10; do ffprobe -v error -select_streams v -show_entries stream=time_base -of csv=p=0 seg_${n}.mp4; done | sort | uniq -c
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy et-anchor4-mute.mp4

python3 make_subs.py
VDUR=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-anchor4-mute.mp4)
ffmpeg -hide_banner -loglevel error -y -i et-anchor4-mute.mp4 -i voices/Kore.mp3 -filter_complex "
  [0:v]subtitles=subs.srt:force_style='FontName=DejaVu Sans,FontSize=20,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Alignment=2,MarginV=40'[v];
  [1:a]adelay=2000|2000,apad[a]" -map "[v]" -map "[a]" -t "$VDUR" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k et-anchor4-final.mp4
echo "=== final ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-anchor4-final.mp4
