#!/usr/bin/env bash
set -e
cd /home/client/workspace/tmp
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0B1220
GR=0x1E6F5C
rm -f L_*.mp4 concatL.txt

# контентный клип: SRC START DUR CROP TITLE N
mkc () {
  local src=$1 start=$2 dur=$3 crop=$4 title=$5 n=$6
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$src" -an -vf "
    ${crop},
    scale=1720:-1,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${BG},
    drawtext=fontfile=${F}:text='${title}':fontcolor=white:fontsize=54:box=1:boxcolor=${GR}@0.95:boxborderw=18:x=60:y=36
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p "L_${n}.mp4"
}

# карточка-титр: TEXT1 TEXT2 DUR N
card () {
  local t1=$1 t2=$2 dur=$3 n=$4
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=${BG}:s=1920x1080:d=${dur}:r=30" -vf "
    drawtext=fontfile=${F}:text='${t1}':fontcolor=white:fontsize=96:x=(w-tw)/2:y=(h/2)-120,
    drawtext=fontfile=${FR}:text='${t2}':fontcolor=0x9fb3c8:fontsize=52:x=(w-tw)/2:y=(h/2)+20
  " -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p "L_${n}.mp4"
}

card  "Extract Text from Image"  "Turn any picture into editable text"   2.5  0
mkc   demo.mp4   5.5 7.0 "crop=1920:875:0:160"     "1   Draw a box on your screen"    1
mkc   demo2.mp4 17.0 7.0 "crop=1920:875:0:160"     "2   Or paste any image (Ctrl+V)"  2
mkc   demo.mp4  49.5 7.0 "crop=1920:875:0:160"     "3   Or upload a file"             3
card  "Free on Chrome"  "www.devexthub.com/extract-text-from-image"  3.0  4

for n in 0 1 2 3 4; do echo "file 'L_${n}.mp4'" >> concatL.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concatL.txt -c copy et-long-mute.mp4
echo "=== long mute готово ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 et-long-mute.mp4