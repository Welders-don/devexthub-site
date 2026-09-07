#!/usr/bin/env bash
# PDF-шорт к лонгу №3 (smallpdf alternative). Вертикаль 1080x1920, голос Fenrir,
# крупные drawtext, БЕЗ караоке (рецепт залетевшего PDF-шорта).
# THEM = src/compressed_2026-09-07_11-15-51.mp4 (стена оплаты smallpdf)
# OUR  = ../pdf-anchor2/src/compressed_2026-08-22_10-22-17.mp4 (наш демо)
set -e
cd /home/client/projects/Devexthub-site/releases/pdf-anchor3
F=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
BG=0x0B1220
RED=0xB00020@0.95
GRN=0x1E6F5C@0.95
THEM=src/compressed_2026-09-07_11-15-51.mp4
OUR=../pdf-anchor2/src/compressed_2026-08-22_10-22-17.mp4
rm -f clip_*.mp4 concat_short.txt

# SRC START DUR CROP TOP BOTTOM BOTCOL N
mkclip () {
  local src=$1 start=$2 dur=$3 crop=$4 top=$5 bottom=$6 botcol=$7 n=$8
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "$src" -an -vf "
    ${crop},
    scale=1000:1330:force_original_aspect_ratio=decrease,
    pad=1080:1920:(ow-iw)/2:300:color=${BG},
    drawtext=fontfile=${F}:text='${top}':fontcolor=white:fontsize=58:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-tw)/2:y=150,
    drawtext=fontfile=${F}:text='${bottom}':fontcolor=white:fontsize=54:box=1:boxcolor=${botcol}:boxborderw=22:x=(w-tw)/2:y=1660
  " -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "clip_${n}.mp4"
}

#      SRC     START DUR  CROP                     TOP                            BOTTOM                    BOTCOL    N
mkclip "$THEM" 20.0  3.0  "crop=1050:720:250:240"  "Smallpdf blocks your download" "Pay Pro or wait 12 hours" "$RED"   1
mkclip "$OUR"  26.6  2.4  "crop=460:900:1448:115"  "This free extension"          "Drop the PDF in"          "black@0.55" 2
mkclip "$OUR"  34.2  2.0  "crop=460:900:1448:115"  "One click"                    "Convert"                  "black@0.55" 3
mkclip "$OUR"  41.0  2.6  "crop=1400:850:60:250"   "Clean sheet, columns intact"  "Download xlsx or csv"     "$GRN"   4
mkclip "$OUR"  85.5  2.5  "crop=1400:850:60:250"   "Convert PDF to Excel"         "Free for Chrome"          "$GRN"   5

for n in 1 2 3 4 5; do echo "file 'clip_${n}.mp4'" >> concat_short.txt; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i concat_short.txt -c copy pdf-short3-mute.mp4
ffmpeg -hide_banner -loglevel error -y -i pdf-short3-mute.mp4 -i voices/Fenrir.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest pdf-short3-final.mp4
echo "=== short ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 pdf-short3-final.mp4
