#!/usr/bin/env bash
# PDF-шорт к лонгу #4 (pdf to csv, 5U1cTz0daGo). Вертикаль 1080x1920, Fenrir, крупные drawtext, без караоке.
# Голос Fenrir.wav (7.3с) порезан по фразам (тайминги Groq), каждая фраза на своём клипе.
set -e
cd /home/client/projects/Devexthub-site/releases/pdf-anchor4/short
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
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
ffmpeg -hide_banner -loglevel error -y -loop 1 -framerate 30 -t 2.6 -i ../mock/paste.png -vf "$(VF crop=760:700:0:110 'PDF table pasted?' 'All in ONE column' "$RED"),trim=duration=2.6" \
  -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -video_track_timescale 30000 clip_1.mp4
mkclip "$NEW" 63.5 1.8 "$PANEL" "PDF to CSV, free" "Drop the PDF in"  "black@0.55" 2
mkclip "$NEW" 67.3 1.6 "$PANEL" "One click"        "Convert"          "black@0.55" 3
mkclip "$NEW" 76.0 1.8 "$PANEL" "Download .csv"    "No upload"        "black@0.55" 4
mkclip "$NEW" 92.0 3.6 "$XL"    "Every value in its cell" "Free in Chrome" "$GRN"  5
: > concat_short.txt; for n in 1 2 3 4 5; do echo "file 'clip_${n}.mp4'" >> concat_short.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat_short.txt -c copy pdf-short4-mute.mp4
# фразы: A 0-2.05 | B 2.10-3.20 | C 3.25-3.98 | D 4.00-5.05 | E 5.10-конец; старт = начало клипа + 0.3/0.1
ffmpeg -hide_banner -loglevel error -y -i Fenrir.wav -filter_complex "
 [0:a]asplit=5[a][b][c][d][e];
 [a]atrim=0:2.05,asetpts=PTS-STARTPTS,adelay=300|300[A];
 [b]atrim=2.10:3.20,asetpts=PTS-STARTPTS,adelay=2700|2700[B];
 [c]atrim=3.25:3.98,asetpts=PTS-STARTPTS,adelay=4500|4500[C];
 [d]atrim=4.00:5.05,asetpts=PTS-STARTPTS,adelay=6100|6100[D];
 [e]atrim=5.10,asetpts=PTS-STARTPTS,adelay=7900|7900[E];
 [A][B][C][D][E]amix=inputs=5:normalize=0,apad[o]" -map "[o]" -t 11.4 voice-short.wav
ffmpeg -hide_banner -loglevel error -y -i pdf-short4-mute.mp4 -i voice-short.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest pdf-short4-final.mp4
echo "=== short ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-short4-final.mp4
