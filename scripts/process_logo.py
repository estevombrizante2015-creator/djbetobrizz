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
im = im.crop(im.getchannel("A").getbbox())
logo = Image.new("RGBA", (im.width + 2 * PAD, im.height + 2 * PAD), (0, 0, 0, 0))
logo.paste(im, (PAD, PAD))

logo.save(f"{OUT}/betobrizz-logo.webp", quality=90, method=6)
small = logo.copy()
small.thumbnail((800, 800))
small.save(f"{OUT}/betobrizz-logo.png", optimize=True)
print("betobrizz-logo", logo.size, "png", small.size)
