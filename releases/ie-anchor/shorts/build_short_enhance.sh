#!/usr/bin/env bash
set -e
cd /home/client/projects/Devexthub-site/releases/ie-anchor/shorts
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x6C5CE7
ICON=../icon.png
S7=../src7.mp4

# вертикальная карточка: T1 T2 DUR OUT
card () {
  local t1=$1 t2=$2 dur=$3 out=$4
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${BG}:s=1080x1920:d=${dur}:r=30" \
    -loop 1 -t "$dur" -i "$ICON" \
    -filter_complex "
      [1:v]scale=240:240[ic];
      [0:v][ic]overlay=(W-w)/2:(H/2)-460[bg];
      [bg]drawtext=fontfile=${F}:text='${t1}':fontcolor=white:fontsize=110:x=(w-tw)/2:y=(h/2)-120,
          drawtext=fontfile=${FR}:text='${t2}':fontcolor=0xE6E1FF:fontsize=52:x=(w-tw)/2:y=(h/2)+40
    " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 "$out"
}

# интро
card "Blurry photo?" "Fix it right in Chrome" 2.0 c_intro.mp4

# реролл before/after (замедлен, кроп карточки сравнения), верхний хук
ffmpeg -hide_banner -loglevel error -y -ss 0.4 -t 2.6 -i "$S7" -an -vf "
  setpts=2.15*PTS,
  crop=1004:478:258:267,
  scale=1080:-2,
  pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},
  drawtext=fontfile=${F}:text='Enhance in one click':fontcolor=white:fontsize=62:box=1:boxcolor=black@0.55:boxborderw=22:x=(w-tw)/2:y=210
" -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 c_reveal.mp4

# энд-карточка с URL лендинга
card "Get it free" "devexthub.com/image-enhancer" 2.6 c_end.mp4

: > concat.txt
for c in c_intro c_reveal c_end; do echo "file '${c}.mp4'" >> concat.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat.txt -c copy short_enhance_mute.mp4
echo "=== mute ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 short_enhance_mute.mp4
