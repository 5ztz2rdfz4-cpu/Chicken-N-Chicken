"""Crop food / signage details out of the two supplied photos (no new imagery invented)."""
import sys
from PIL import Image, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
SF = Image.open(f"{src}/storefront.png").convert("RGB")
CT = Image.open(f"{src}/counter.jpg").convert("RGB")
CROPS = {
  "burger":   (SF, (818, 465, 948, 640)),
  "tenders":  (SF, (462, 548, 740, 645)),
  "fries":    (SF, (716, 495, 816, 605)),
  "sandwich": (SF, (172, 462, 380, 576)),
  "foodrow":  (SF, (262, 522, 958, 648)),
  "sign":     (SF, (140, 108, 1035, 380)),
  "menustrip":(SF, (272, 780, 792, 834)),
  "neon":     (CT, (330, 1040, 1290, 1663)),
  "pickup":   (CT, (420, 600, 1290, 1080)),
}
for name, (im, box) in CROPS.items():
    c = im.crop(box)
    s = max(1, int(round(900 / c.width)))
    c = c.resize((c.width * s, c.height * s), Image.LANCZOS)
    c = c.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    c = ImageEnhance.Color(c).enhance(1.08)
    c.save(f"{out}/{name}.jpg", quality=93)
    print(name, c.size)
