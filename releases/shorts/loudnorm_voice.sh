#!/usr/bin/env bash
# Two-pass loudnorm на финальный голос/ролик под соцсети.
# Таргет -14 LUFS / -1 dBTP / LRA 11 — стандарт YouTube/TikTok/IG (их авто-нормализация).
# Точнее one-pass: пас 1 меряет реальную громкость, пас 2 нормализует с measured_*.
# Метод из browser-use/video-use (helpers/render.py, MIT).
#
# Usage: ./loudnorm_voice.sh in.mp4 out.mp4
set -e
IN="$1"; OUT="$2"
[ -z "$IN" ] || [ -z "$OUT" ] && { echo "usage: $0 in.mp4 out.mp4"; exit 1; }

I=-14; TP=-1; LRA=11

# --- Пас 1: замер (JSON печатается в stderr в конце прогона) ---
echo "loudnorm пас 1: замер $IN"
MEAS=$(ffmpeg -hide_banner -nostats -y -i "$IN" \
  -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" \
  -vn -f null - 2>&1 | sed -n '/^{/,/^}/p')

get () { echo "$MEAS" | grep "\"$1\"" | sed -E 's/.*: *"?([-0-9.a-z]+)"?.*/\1/'; }
MI=$(get input_i); MTP=$(get input_tp); MLRA=$(get input_lra)
MTHR=$(get input_thresh); OFF=$(get target_offset)

if [ -z "$MI" ]; then
  echo "замер не удался → one-pass fallback"
  ffmpeg -hide_banner -nostats -y -i "$IN" \
    -c:v copy -af "loudnorm=I=$I:TP=$TP:LRA=$LRA" \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
  exit 0
fi
echo "  измерено: I=$MI LUFS  TP=$MTP  LRA=$MLRA"

# --- Пас 2: нормализация с measured_* + linear=true ---
echo "loudnorm пас 2: нормализация → $OUT"
ffmpeg -hide_banner -nostats -y -i "$IN" -c:v copy \
  -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:measured_I=$MI:measured_TP=$MTP:measured_LRA=$MLRA:measured_thresh=$MTHR:offset=$OFF:linear=true" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
echo "готово: $OUT (-14 LUFS / -1 dBTP)"
