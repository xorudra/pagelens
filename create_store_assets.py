from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent


def rounded_gradient(size, rect, radius, top, bottom, scale=4):
    w, h = size
    image = Image.new("RGBA", (w * scale, h * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for y in range(h * scale):
        t = y / max(1, h * scale - 1)
        color = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3)) + (255,)
        draw.line((0, y, w * scale, y), fill=color)
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        tuple(v * scale for v in rect), radius=radius * scale, fill=255
    )
    image.putalpha(mask)
    return image


def draw_lens(draw, center, radius, color, width, scale):
    x, y = center
    draw.ellipse(
        ((x - radius) * scale, (y - radius) * scale,
         (x + radius) * scale, (y + radius) * scale),
        outline=color,
        width=width * scale,
    )
    draw.line(
        ((x + radius * .66) * scale, (y + radius * .66) * scale,
         (x + radius * 1.38) * scale, (y + radius * 1.38) * scale),
        fill=color,
        width=width * scale,
    )


def make_icon(size):
    scale = 4
    image = rounded_gradient(
        (size, size), (size // 8, size // 8, size * 7 // 8, size * 7 // 8),
        size // 5, (99, 83, 255), (48, 126, 246), scale
    )
    draw = ImageDraw.Draw(image)
    draw_lens(draw, (size * .45, size * .44), size * .205, (250, 252, 255, 255),
              max(2, round(size * .075)), scale)
    draw.ellipse((size * .375 * scale, size * .35 * scale, size * .49 * scale,
                  size * .465 * scale), fill=(118, 231, 255, 255))
    return image.resize((size, size), Image.Resampling.LANCZOS)


for size in (16, 48, 128):
    make_icon(size).save(ROOT / f"icon{size}.png", optimize=True)


# Store promo: an illustrative, brand-focused image showing the core design tools.
scale = 2
w, h = 440, 280
image = Image.new("RGB", (w * scale, h * scale), (13, 19, 42))
pixels = image.load()
for y in range(h * scale):
    t = y / (h * scale - 1)
    for x in range(w * scale):
        glow = max(0, 1 - (((x / scale - 335) / 230) ** 2 + ((y / scale - 40) / 220) ** 2) ** .5)
        base = (15, 23, 55)
        target = (63, 72, 170)
        pixels[x, y] = tuple(
            max(0, min(255, int(base[i] * (1 - max(t * .42, glow * .65)) + target[i] * max(t * .42, glow * .65))))
            for i in range(3)
        )

draw = ImageDraw.Draw(image)
draw.rounded_rectangle((52 * scale, 38 * scale, 389 * scale, 245 * scale),
                       radius=18 * scale, fill=(245, 248, 255), outline=(255, 255, 255), width=2 * scale)
draw.rounded_rectangle((52 * scale, 38 * scale, 389 * scale, 71 * scale),
                       radius=18 * scale, fill=(31, 39, 73))
draw.rectangle((52 * scale, 58 * scale, 389 * scale, 71 * scale), fill=(31, 39, 73))
for i, color in enumerate(((255, 110, 123), (255, 202, 91), (85, 220, 164))):
    x = 72 + i * 16
    draw.ellipse((x * scale, 51 * scale, (x + 8) * scale, 59 * scale), fill=color)

# Page content area and inspector panel.
draw.rounded_rectangle((69 * scale, 91 * scale, 245 * scale, 218 * scale),
                       radius=10 * scale, fill=(230, 236, 250))
draw.rounded_rectangle((84 * scale, 106 * scale, 160 * scale, 193 * scale),
                       radius=8 * scale, fill=(123, 145, 218))
draw.rounded_rectangle((171 * scale, 107 * scale, 228 * scale, 116 * scale),
                       radius=4 * scale, fill=(91, 108, 154))
draw.rounded_rectangle((171 * scale, 125 * scale, 220 * scale, 131 * scale),
                       radius=3 * scale, fill=(163, 174, 205))
draw.rounded_rectangle((171 * scale, 139 * scale, 228 * scale, 145 * scale),
                       radius=3 * scale, fill=(163, 174, 205))
draw.rounded_rectangle((171 * scale, 156 * scale, 208 * scale, 176 * scale),
                       radius=5 * scale, fill=(90, 128, 247))
draw.rounded_rectangle((258 * scale, 85 * scale, 372 * scale, 224 * scale),
                       radius=10 * scale, fill=(255, 255, 255))
draw.rounded_rectangle((272 * scale, 97 * scale, 346 * scale, 105 * scale),
                       radius=4 * scale, fill=(69, 80, 120))
draw.rounded_rectangle((272 * scale, 115 * scale, 355 * scale, 121 * scale),
                       radius=3 * scale, fill=(183, 190, 212))
draw.rounded_rectangle((272 * scale, 128 * scale, 350 * scale, 134 * scale),
                       radius=3 * scale, fill=(183, 190, 212))
for i, color in enumerate(((83, 118, 244), (147, 113, 248), (60, 195, 180), (250, 174, 101))):
    x = 272 + i * 20
    draw.rounded_rectangle((x * scale, 151 * scale, (x + 15) * scale, 166 * scale),
                           radius=4 * scale, fill=color)
draw_lens(draw, (362, 206), 31, (119, 227, 255, 255), 10, scale)
promo_path = ROOT / "promo-small.png"
image.resize((w, h), Image.Resampling.LANCZOS).save(promo_path, optimize=True)

print(f"Created extension icons and promo image in {ROOT}")
