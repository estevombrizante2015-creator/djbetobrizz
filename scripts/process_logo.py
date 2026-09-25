"""Gera versões transparentes do logo a partir de trabalho/minhalogo.jpeg.

Fundo original: cinza uniforme (247). Contorno: branco puro (255).
- logo-original.png: cores originais, fundo removido (para fundos claros)
- logo-dark.png: variante para fundos escuros (preto -> branco, vermelho mantido)
"""
import numpy as np
from PIL import Image

SRC = "trabalho/minhalogo.jpeg"
BG = 247.0

im = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
lum = (r + g + b) / 3
chroma = im.max(axis=2) - im.min(axis=2)

alpha = np.zeros(lum.shape, np.float32)
darker = lum < BG
alpha[darker] = (BG - lum[darker]) / BG          # composto com preto
lighter = ~darker
alpha[lighter] = np.clip((lum[lighter] - BG) / (255 - BG), 0, 1)  # composto com branco
colored = chroma > 40
alpha[colored] = 1.0
alpha = np.clip(alpha * 1.15, 0, 1)  # leve reforço nas bordas

# cor "limpa": preto onde era escuro, branco onde era claro, cor original onde colorido
rgb = np.zeros_like(im)
rgb[lighter] = 255
rgb[colored] = im[colored]

def save(rgb_arr, name):
    out = np.dstack([rgb_arr, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    img = img.crop((max(bbox[0]-4,0), max(bbox[1]-4,0), bbox[2]+4, bbox[3]+4))
    img.save(f"public/images/logo/{name}.png", optimize=True)
    img.save(f"public/images/logo/{name}.webp", quality=92, method=6)
    print(name, img.size)

import os
os.makedirs("public/images/logo", exist_ok=True)
save(rgb, "logo-original")

# variante escura: inverte preto/branco, mantém o vermelho
dark = 255 - rgb
dark[colored] = im[colored]
save(dark, "logo-dark")
