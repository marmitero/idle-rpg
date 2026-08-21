const cache = new Map<string, string>();

export function chromaUrl(src: string): Promise<string> {
  const hit = cache.get(src);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i] ?? 0;
        const g = p[i + 1] ?? 0;
        const b = p[i + 2] ?? 0;
        if (r > 220 && g < 40 && b > 220) p[i + 3] = 0;
      }
      ctx.putImageData(d, 0, 0);
      const url = c.toDataURL("image/png");
      cache.set(src, url);
      resolve(url);
    };
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}
