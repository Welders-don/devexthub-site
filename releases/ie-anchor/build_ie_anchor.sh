#!/usr/bin/env bash
# Якорный ролик Image Enhancer: карточки + сочные куски ролика7 + титры-шаги.
# Источник: src7.mp4 (74.7s). Мёртвые паузы вырезаны. Голос кладётся отдельно.
set -e
cd /home/client/projects/Devexthub-site/releases/ie-anchor
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x6C5CE7   # бренд-фиолетовый
S7=src7.mp4

# сегмент: SRC START DUR TITLE N SPEED(=setpts множитель, 1=норм)
seg () {
  local src=$1 start=$2 dur=$3 title=$4 n=$5 speed=${6:-1}
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$src" -an -vf "
    setpts=${speed}*PTS,
    scale=1920:1080:force_original_aspect_ratio=decrease,
    pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
    drawtext=fontfile=${F}:text='${title}':fontcolor=white:fontsize=46:box=1:boxcolor=${BG}@0.95:boxborderw=16:x=40:y=40
  " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_${n}.mp4"
}

# карточка с иконкой расширения: TEXT1 TEXT2 DUR N
card () {
  local t1=$1 t2=$2 dur=$3 n=$4
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${BG}:s=1920x1080:d=${dur}:r=30" \
    -loop 1 -t "$dur" -i icon.png \
    -filter_complex "
      [1:v]scale=180:180[ic];
      [0:v][ic]overlay=(W-w)/2:(H/2)-380[bg];
      [bg]drawtext=fontfile=${F}:text='${t1}':fontcolor=white:fontsize=96:x=(w-tw)/2:y=(h/2)-120,
          drawtext=fontfile=${FR}:text='${t2}':fontcolor=0xE6E1FF:fontsize=46:x=(w-tw)/2:y=(h/2)+10
    " -r 30 -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -video_track_timescale 30000 "seg_${n}.mp4"
}

# тайминги выровнены по триггерам голоса (need@11.3 out@14.5 every@17.8 get@22.1 видео-время)
card "Image Enhancer" "Upscale . Enhance . Unblur - right in Chrome" 2.0 00
seg  $S7  0.4 2.6 "Enhance"     01 3.58
seg  $S7 32.0 3.2 "Upscale 4x"  02
seg  $S7 68.0 3.3 "Unblur"      03
seg  $S7 35.2 4.3 "Fully Local"  04
card "Image Enhancer" "Search this name on the Chrome Web Store" 2.5 05

: > concat.txt
for n in 00 01 02 03 04 05; do echo "file 'seg_${n}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy ie-anchor-mute.mp4
echo "=== mute master ==="
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 ie-anchor-mute.mp4
