#!/usr/bin/env python3
"""Print the dark pixels of the jar's 50x50 GraphicsPath PNG.

Usage: python3 -I plans/insecure-path-egg/measurements/decode-motif.py <file.png> [x0 x1]

The jar writes this PNG even for -tsvg under SecurityProfile.INSECURE
(PSystemPath.java:60-63, GraphicsPath.java:66-88). '#' is a pixel below 128 on
the red channel, '+' an antialiased pixel, '.' white. Columns x0..x1 (default
8..26) are printed, one row per y that has ink. Planning used it to confirm that
`path ABCabc` draws (20,20)->(17,17)->(15,14)->(14,11)->(16,11)->(19,11)->(16,12),
the points UMotif(String) computes (UMotif.java:60-67, :87-92).
"""
import struct
import sys
import zlib


def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def unfilter(raw, width, height, bpp):
    stride = width * bpp
    rows, prev, k = [], bytearray(stride), 0
    for _ in range(height):
        f = raw[k]
        line = bytearray(raw[k + 1:k + 1 + stride])
        k += 1 + stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            pred = {0: 0, 1: a, 2: b, 3: (a + b) // 2, 4: paeth(a, b, c)}[f]
            line[x] = (line[x] + pred) & 255
        rows.append(line)
        prev = line
    return rows


def load(path):
    data = open(path, 'rb').read()
    # IHDR is the first chunk of every PNG (PNG spec 11.2.2): bytes 16..26.
    width, height, _depth, colour = struct.unpack('>IIBB', data[16:26])
    i, idat = 8, b''
    while i < len(data):
        (n,) = struct.unpack('>I', data[i:i + 4])
        kind, chunk = data[i + 4:i + 8], data[i + 8:i + 8 + n]
        if kind == b'IDAT':
            idat += chunk
        i += 12 + n
    bpp = 3 if colour == 2 else 4
    return width, height, bpp, unfilter(zlib.decompress(idat), width, height, bpp)


def main():
    path = sys.argv[1]
    x0, x1 = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (8, 26)
    width, height, bpp, rows = load(path)
    print(f'{path}: {width}x{height}')
    for y in range(height):
        cells = []
        for x in range(x0, x1):
            red = rows[y][bpp * x]
            cells.append('#' if red < 128 else '+' if red < 250 else '.')
        line = ''.join(cells)
        if line.strip('.'):
            print(f'{y:2d} {line}')


if __name__ == '__main__':
    main()
