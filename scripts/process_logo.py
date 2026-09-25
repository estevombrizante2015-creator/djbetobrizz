"""Prepara o logo oficial a partir de trabalho/novologo.png (PNG com fundo transparente).

Gera em public/images/logo/:
- betobrizz-logo.webp: logo principal do site (resolução total, recortado).
- betobrizz-logo.png: versão 800px para JSON-LD / compartilhamento.

Uso: python scripts/process_logo.py   (depois rode `npm run images` para atualizar os metadados)
"""
import os

from PIL import Image

SRC = "trabalho/novologo.png"
OUT = "public/images/logo"
PAD = 6

os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGBA")
im = im.crop(im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())  # ignora pixels quase transparentes
logo = Image.new("RGBA", (im.width + 2 * PAD, im.height + 2 * PAD), (0, 0, 0, 0))
logo.paste(im, (PAD, PAD))

logo.save(f"{OUT}/betobrizz-logo.webp", quality=90, method=6)

# versão leve para usos pequenos (cabeçalho, rodapé, selos) — separa do arquivo do hero (LCP)
sm = logo.copy()
sm.thumbnail((640, 640), Image.LANCZOS)
sm.save(f"{OUT}/betobrizz-logo-sm.webp", quality=90, method=6)

small = logo.copy()
small.thumbnail((800, 800))
small.save(f"{OUT}/betobrizz-logo.png", optimize=True)
print("betobrizz-logo", logo.size, "sm", sm.size, "png", small.size)
