"""YouTube thumbnails for the club video: a frame from the stage plus one neon headline (picture + headline only).

    ~/llms-explained/.venv/bin/python tools/yt_thumbs.py <renders dir> <out dir>

A: Ash doing the six-seven with the Claudios on her hands, "6" and "7" either side of her.
B: the Claudio ring from above, "SIX SEVEN CLAUDIOS".
C: the sunglasses Claudio up close, "MADE WITH CLAUDE".
Each is 1280x720; the bottom-right 120x60 stays clear for YouTube's timestamp.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
FONT = "/System/Library/Fonts/Avenir Next Condensed.ttc"
HEAVY = 8
PINK, CYAN, YELLOW = (255, 79, 176), (62, 240, 255), (255, 225, 79)


def neon(im, text, xy, size, glow, anchor="la", core=(255, 255, 255)):
    """White-hot letters with a coloured halo, like the club's neon signs."""
    font = ImageFont.truetype(FONT, size, index=HEAVY)
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).text(xy, text, font=font, fill=255, anchor=anchor)
    for radius, strength in ((size * .22, 1.0), (size * .08, 1.0)):
        halo = mask.filter(ImageFilter.GaussianBlur(radius)).point(lambda v: min(255, int(v * 2.2 * strength)))
        im.paste(Image.new("RGB", im.size, glow), (0, 0), halo)
    dark = Image.new("L", im.size, 0)                                    # a thin dark edge so the letters hold on busy pixels
    ImageDraw.Draw(dark).text(xy, text, font=font, fill=255, anchor=anchor, stroke_width=max(3, size // 28))
    im.paste(Image.new("RGB", im.size, (20, 6, 24)), (0, 0), dark.point(lambda v: int(v * .55)))
    im.paste(Image.new("RGB", im.size, core), (0, 0), mask)
    return im


def darken(im, box, amount=.45):
    """Dim one region a little so the headline sits on calm pixels."""
    region = im.crop(box).point(lambda v: int(v * (1 - amount)))
    im.paste(region, box[:2])
    return im


a = Image.open(SRC / "yt-thumb-a.png").convert("RGB")
neon(a, "6", (190, 330), 300, PINK, anchor="mm")
neon(a, "7", (1090, 330), 300, CYAN, anchor="mm")
a.save(OUT / "thumb-A.png")

b = Image.open(SRC / "yt-thumb-b.png").convert("RGB")
darken(b, (0, 0, 1280, 250), .5)
neon(b, "SIX SEVEN", (640, 105), 150, PINK, anchor="mm")
neon(b, "CLAUDIOS", (640, 215), 110, YELLOW, anchor="mm")
b.save(OUT / "thumb-B.png")

c = Image.open(SRC / "yt-thumb-c.png").convert("RGB")
darken(c, (0, 0, 560, 400), .35)
neon(c, "MADE WITH", (40, 40), 110, CYAN)
neon(c, "CLAUDE", (40, 150), 170, PINK)
c.save(OUT / "thumb-C.png")
print("ok")
