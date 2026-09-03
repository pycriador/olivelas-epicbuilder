import type { Print } from "@/data/galeria";
import { isVideoMedia } from "@/data/galeria";

const DB_NAME = "aiportal.gallery";
const STORE = "images";
const IDB_PREFIX = "idb:";

const objectUrlCache = new Map<string, string>();

function isDataUrl(url: string) {
  return url.startsWith("data:");
}

export function isGalleryRef(url: string) {
  return url.startsWith(IDB_PREFIX);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storePut(key: string, value: Blob): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      }),
  );
}

function storeGet(key: string): Promise<Blob | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => {
          db.close();
          resolve(req.result as Blob | undefined);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      }),
  );
}

function storeDelete(key: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      }),
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao ler a imagem da galeria."));
    img.src = url;
  });
}

async function compressToJpeg(dataUrl: string, maxWidth = 1600, quality = 0.78): Promise<Blob> {
  // Prefer full-resolution WebP (smaller without changing pixel size for most screenshots).
  void maxWidth;
  void quality;
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, img.width);
  canvas.height = Math.max(1, img.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const res = await fetch(dataUrl);
    return res.blob();
  }
  ctx.drawImage(img, 0, 0);
  const webp = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", 0.92),
  );
  if (webp && webp.size > 0) return webp;
  const jpeg = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92),
  );
  if (jpeg) return jpeg;
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function persistGaleria(caseId: string, galeria: Print[]): Promise<Print[]> {
  const next: Print[] = [];
  for (const print of galeria) {
    if (!print.url || !isDataUrl(print.url)) {
      next.push(print);
      continue;
    }
    if (isVideoMedia(print.url, print.mimeType)) {
      const blob = await (await fetch(print.url)).blob();
      await storePut(print.id, blob);
      next.push({ ...print, url: `${IDB_PREFIX}${print.id}` });
      continue;
    }
    const blob = await compressToJpeg(print.url);
    await storePut(print.id, blob);
    next.push({ ...print, url: `${IDB_PREFIX}${print.id}` });
  }
  return next;
}

export async function hydrateGaleria(galeria: Print[]): Promise<Print[]> {
  const next: Print[] = [];
  for (const print of galeria) {
    if (!isGalleryRef(print.url)) {
      next.push(print);
      continue;
    }
    const key = print.url.slice(IDB_PREFIX.length);
    const cached = objectUrlCache.get(key);
    if (cached) {
      next.push({ ...print, url: cached });
      continue;
    }
    const blob = await storeGet(key);
    if (!blob) {
      next.push(print);
      continue;
    }
    const objectUrl = URL.createObjectURL(blob);
    objectUrlCache.set(key, objectUrl);
    next.push({ ...print, url: objectUrl });
  }
  return next;
}

export async function deleteGaleriaImages(galeria: Print[]) {
  for (const print of galeria) {
    const key = isGalleryRef(print.url) ? print.url.slice(IDB_PREFIX.length) : print.id;
    const cached = objectUrlCache.get(key);
    if (cached) {
      URL.revokeObjectURL(cached);
      objectUrlCache.delete(key);
    }
    try {
      await storeDelete(key);
    } catch {
      /* ignore */
    }
  }
}
