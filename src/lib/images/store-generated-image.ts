import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

function getProjectRoot() {
  const explicitRoot = process.env.RASTINO_PROJECT_ROOT?.trim();

  if (explicitRoot) return explicitRoot;

  const cwd = process.cwd();
  const marker = `${path.sep}.next${path.sep}standalone`;

  if (cwd.includes(marker)) {
    return cwd.split(marker)[0];
  }

  return cwd;
}

function getMimeFromContentType(contentType: string | null) {
  if (!contentType) return "image/png";

  const clean = contentType.toLowerCase();

  if (clean.includes("jpeg") || clean.includes("jpg")) return "image/jpeg";
  if (clean.includes("webp")) return "image/webp";
  if (clean.includes("gif")) return "image/gif";
  if (clean.includes("png")) return "image/png";

  return "image/png";
}

function getExtFromMime(mime: string) {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "png";
}

function parseDataUrl(value: string) {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) return null;

  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function writeImage(buffer: Buffer, mime: string) {
  const root = getProjectRoot();
  const dir = path.join(root, "public", "generated", "images");

  await fs.mkdir(dir, { recursive: true });

  const ext = getExtFromMime(mime);
  const filename = `rastino-image-${Date.now()}-${randomUUID()}.${ext}`;
  const filePath = path.join(dir, filename);

  await fs.writeFile(filePath, buffer);

  return {
    filename,
    filePath,
    url: `/generated/images/${filename}`,
  };
}

export async function storeGeneratedImageLocally(imageUrl: string) {
  const cleanUrl = String(imageUrl || "").trim();

  if (!cleanUrl) {
    throw new Error("Image URL is empty.");
  }

  if (cleanUrl.startsWith("/generated/images/")) {
    return {
      url: cleanUrl,
      originalUrl: cleanUrl,
    };
  }

  if (cleanUrl.startsWith("data:image/")) {
    const parsed = parseDataUrl(cleanUrl);

    if (!parsed) {
      throw new Error("Invalid image data URL.");
    }

    const saved = await writeImage(parsed.buffer, parsed.mime);

    return {
      url: saved.url,
      originalUrl: null,
    };
  }

  const response = await fetch(cleanUrl, {
    cache: "no-store",
    headers: {
      "User-Agent": "RastinoImageStorage/1.0",
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");

  if (contentType && !contentType.toLowerCase().includes("image/")) {
    throw new Error(`Downloaded file is not an image: ${contentType}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mime = getMimeFromContentType(contentType);
  const saved = await writeImage(buffer, mime);

  return {
    url: saved.url,
    originalUrl: cleanUrl,
  };
}
