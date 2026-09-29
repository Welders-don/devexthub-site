#!/usr/bin/env bash
# PDF-шорт к лонгу #4 (pdf to csv, 5U1cTz0daGo). Вертикаль 1080x1920, Fenrir, крупные drawtext, без караоке.
# Голос Fenrir.wav ОДНИМ треком (atempo 0.9, старт 0.3с); длины клипов = границы слов по Groq (fenrir_words.json).
# v1 резал голос на 5 кусков с паузами и попадал резом в слова: звук рвался (Денис 29.09). Голос не резать.
set -e
cd /home/client/projects/Devexthub-site/releases/pdf-anchor4/short
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FR=/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf
BG=0x0B1220; RED=0xB00020@0.95; GRN=0x1E6F5C@0.95
NEW=../src/compressed_2026-09-28_13-52-59.mp4
PANEL="crop=450:900:1450:110"; XL="crop=440:620:850:300"
rm -f clip_*.mp4
VF () { echo "$1,scale=1000:1330:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:300:color=${BG},
    drawtext=fontfile=${F}:text='$2':fontcolor=white:fontsize=58:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-tw)/2:y=150,
    drawtext=fontfile=${F}:text='$3':fontcolor=white:fontsize=54:box=1:boxcolor=$4:boxborderw=22:x=(w-tw)/2:y=1660,
    tpad=stop_mode=clone:stop_duration=10"; }
# SRC START DUR CROP TOP BOTTOM BOTCOL N
mkclip () { ffmpeg -hide_banner -loglevel error -y -ss "$2" -t "$3" -i "$1" -an -vf "$(VF "$4" "$5" "$6" "$7"),trim=duration=$3" \
  -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 "clip_$8.mp4"; }
ffmpeg -hide_banner -loglevel error -y -loop 1 -framerate 30 -t 2.70 -i ../mock/paste.png -vf "$(VF crop=760:700:0:110 'PDF table pasted?' 'All in ONE column' "$RED"),trim=duration=2.70" \
  -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 clip_1.mp4
mkclip "$NEW" 63.5 1.36 "$PANEL" "PDF to CSV, free" "Drop the PDF in"  "black@0.55" 2
mkclip "$NEW" 67.3 0.68 "$PANEL" "One click"        "Convert"          "black@0.55" 3
mkclip "$NEW" 76.0 0.83 "$PANEL" "Download .csv"    "No upload"        "black@0.55" 4
mkclip "$NEW" 92.0 3.33 "$XL"    "Every value in its cell" "Free in Chrome" "$GRN"  5
# концовка как в лонге: иконка стора + название + Free on Chrome - devexthub.com, фон 0x0F6B39
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=0x0F6B39:s=1080x1920:d=2.5:r=30" -loop 1 -t 2.5 -i ../icon.png \
  -filter_complex "[1:v]scale=220:220[ic];[0:v][ic]overlay=(W-w)/2:(H/2)-420[bg];
    [bg]drawtext=fontfile=${F}:text='Convert PDF to Excel':fontcolor=white:fontsize=76:x=(w-tw)/2:y=(h/2)-120,
        drawtext=fontfile=${FR}:text='Free on Chrome - devexthub.com':fontcolor=0xD7F0E1:fontsize=48:x=(w-tw)/2:y=(h/2)+10" \
  -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 clip_6.mp4
: > concat_short.txt; for n in 1 2 3 4 5 6; do echo "file 'clip_${n}.mp4'" >> concat_short.txt; done
for n in 1 2 3 4 5 6; do ffprobe -v error -select_streams v -show_entries stream=time_base -of csv=p=0 clip_${n}.mp4; done | sort | uniq -c
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat_short.txt -c copy pdf-short4-mute.mp4
VDUR=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-short4-mute.mp4)
ffmpeg -hide_banner -loglevel error -y -i Fenrir.wav -af "atempo=0.9,adelay=300|300,apad" -t "$VDUR" voice-short.wav
ffmpeg -hide_banner -loglevel error -y -i pdf-short4-mute.mp4 -i voice-short.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t "$VDUR" pdf-short4-final.mp4
echo "=== short ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-short4-final.mp4
