#!/bin/zsh
# Stamp a LOOKMAXXIN.COM watermark onto videos or images (any number of files).
#
#   brand/watermark.sh clip1.mp4 clip2.mov photo.jpg
#   STYLE=pill-orange-star POS=bottom SIZE=0.5 brand/watermark.sh clip.mp4
#
# STYLE  = a file in brand/watermarks without .png (default: pill-orange)
# POS    = top | middle | bottom | corner   (default: top — clear of TikTok/Reels captions and buttons)
# SIZE   = watermark width as a fraction of the video width (default 0.42)
# Output goes next to the input as <name>_wm.<ext>. Audio is copied untouched.
set -e
here="${0:A:h}"
style="${STYLE:-pill-orange}"
pos="${POS:-top}"
size="${SIZE:-0.42}"
wm="$here/watermarks/$style.png"
[ -f "$wm" ] || { echo "No watermark $wm — run: python3 $here/make-watermarks.py"; exit 1; }
[ $# -gt 0 ] || { sed -n '2,11p' "$0"; exit 1; }

case "$pos" in
  top)    xy="x=(W-w)/2:y=H*0.11" ;;
  middle) xy="x=(W-w)/2:y=(H-h)/2" ;;
  bottom) xy="x=(W-w)/2:y=H*0.70" ;;   # above the caption area on 9:16 video
  corner) xy="x=W-w-W*0.04:y=H*0.04"; size="${SIZE:-0.28}" ;;
  *) echo "POS must be top, middle, bottom or corner"; exit 1 ;;
esac

for f in "$@"; do
  [ -f "$f" ] || { echo "skip (not found): $f"; continue; }
  ext="${f:e:l}"; out="${f:r}_wm.${f:e}"
  filter="[1:v][0:v]scale2ref=w=iw*${size}:h=ow/mdar[wm][base];[base][wm]overlay=${xy}"
  if [[ "$ext" == (jpg|jpeg|png|webp) ]]; then
    ffmpeg -loglevel error -y -i "$f" -i "$wm" -filter_complex "$filter" -frames:v 1 "$out"
  else
    ffmpeg -loglevel error -y -i "$f" -i "$wm" -filter_complex "$filter" -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a copy -movflags +faststart "$out"
  fi
  echo "✓ $out"
done
