"""Makes transparent LOOKSMAXXIN.COM watermark PNGs in the site's brand style (Archivo Black, orange #ff4d00,
hard black offset shadow like the site's buttons). Run: python3 brand/make-watermarks.py  -> brand/watermarks/*.png"""
from PIL import Image, ImageDraw, ImageFont
import os, math

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, 'fonts', 'ArchivoBlack-Regular.ttf')
OUT = os.path.join(HERE, 'watermarks')
os.makedirs(OUT, exist_ok=True)

ORANGE = (255, 77, 0, 255)
INK = (18, 18, 18, 255)
WHITE = (255, 255, 255, 255)
CREAM = (243, 238, 226, 255)


def text_size(font, text):
    l, t, r, b = font.getbbox(text)
    return r - l, b - t, l, t


def pill(text, size, fill, text_fill, outline=INK, shadow=INK, stroke=0, star=False, name=None):
    """Rounded 'bubble' badge with a hard offset shadow (the site's neo-brutalist button look)."""
    font = ImageFont.truetype(FONT, size)
    label = text
    tw, th, ox, oy = text_size(font, label)
    star_w = int(th * 1.25) if star else 0  # the font has no ★ glyph, so the star is drawn as a shape
    tw += star_w
    padx, pady = int(size * 0.62), int(size * 0.42)
    border = max(4, size // 11)
    off = max(6, size // 7)  # shadow offset
    w, h = tw + padx * 2, th + pady * 2
    img = Image.new('RGBA', (w + off + border * 2, h + off + border * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = h // 2
    x0, y0 = border, border
    d.rounded_rectangle([x0 + off, y0 + off, x0 + w + off, y0 + h + off], r, fill=shadow)
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], r, fill=fill, outline=outline, width=border)
    if star:
        cx, cy, R = x0 + padx + th * 0.5, y0 + pady + th * 0.5, th * 0.62
        pts = [(cx + (R if i % 2 == 0 else R * 0.42) * math.sin(i * math.pi / 5), cy - (R if i % 2 == 0 else R * 0.42) * math.cos(i * math.pi / 5)) for i in range(10)]
        d.polygon(pts, fill=text_fill)
    d.text((x0 + padx + star_w - ox, y0 + pady - oy), label, font=font, fill=text_fill, stroke_width=stroke, stroke_fill=INK)
    img.save(os.path.join(OUT, name))
    return name


def outlined(text, size, fill, name):
    """Bare outlined text with a hard shadow — for corners where a badge is too heavy."""
    font = ImageFont.truetype(FONT, size)
    tw, th, ox, oy = text_size(font, text)
    stroke = max(4, size // 9)
    off = max(5, size // 9)
    pad = stroke * 2 + off
    img = Image.new('RGBA', (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.text((pad - ox + off, pad - oy + off), text, font=font, fill=INK, stroke_width=stroke, stroke_fill=INK)
    d.text((pad - ox, pad - oy), text, font=font, fill=fill, stroke_width=stroke, stroke_fill=INK)
    img.save(os.path.join(OUT, name))
    return name


made = [
    pill('LOOKSMAXXIN.COM', 72, ORANGE, WHITE, stroke=0, name='pill-orange.png'),            # main bug: orange bubble, white text
    pill('LOOKSMAXXIN.COM', 72, ORANGE, INK, name='pill-orange-ink.png'),                     # orange bubble, black text (site button look)
    pill('LOOKSMAXXIN.COM', 72, CREAM, INK, shadow=ORANGE, name='pill-cream.png'),            # cream bubble, orange shadow (site card look)
    pill('LOOKSMAXXIN.COM', 72, ORANGE, WHITE, star=True, name='pill-orange-star.png'),       # with the site's star
    pill('LOOKSMAXXIN.COM', 40, ORANGE, WHITE, name='pill-orange-small.png'),                 # small corner bug
    outlined('LOOKSMAXXIN.COM', 90, ORANGE, 'text-orange.png'),                               # bare outlined text
    outlined('LOOKSMAXXIN.COM', 90, WHITE, 'text-white.png'),
    pill('FULL BREAKDOWN ON LOOKSMAXXIN.COM', 54, ORANGE, WHITE, name='cta-orange.png'),     # end-card / caption call to action
]
print('\n'.join(os.path.join(OUT, m) for m in made))
