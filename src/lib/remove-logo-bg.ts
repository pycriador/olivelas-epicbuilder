/**
 * Remove o fundo sólido de um logo enviado pelo usuário.
 * Faz flood fill a partir das bordas removendo pixels de cor semelhante
 * à cor dominante das bordas (fundo branco/cinza/colorido uniforme).
 */
export async function removeLogoBackground(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 512;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível neste navegador.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const image = ctx.getImageData(0, 0, w, h);
  const px = image.data;

  const at = (x: number, y: number) => (y * w + x) * 4;
  // Cor de referência: média dos quatro cantos.
  const corners = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
  const ref = [0, 1, 2].map(
    (c) => corners.reduce((sum, i) => sum + (px[i + c] ?? 0), 0) / corners.length,
  ) as [number, number, number];

  const tolerance = 46;
  const similar = (i: number) =>
    Math.abs((px[i] ?? 0) - ref[0]) +
      Math.abs((px[i + 1] ?? 0) - ref[1]) +
      Math.abs((px[i + 2] ?? 0) - ref[2]) <
    tolerance * 3;

  const visited = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) {
    stack.push(x, 0, x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    stack.push(0, y, w - 1, y);
  }

  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const flat = y * w + x;
    if (visited[flat]) continue;
    const i = flat * 4;
    if (!similar(i)) continue;
    visited[flat] = 1;
    px[i + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
