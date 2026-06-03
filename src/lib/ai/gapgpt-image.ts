import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

type GenerateGapGptImageArgs = {
  model: string;
  prompt: string;
  size?: string;
};

type GapGptImageResponse = {
  data?: {
    url?: string;
    b64_json?: string;
  }[];
};

function getGapGptBaseUrl() {
  return process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1";
}

function getGapGptHeaders() {
  const apiKey = process.env.GAPGPT_API_KEY;

  if (!apiKey?.trim()) {
    throw new Error("GAPGPT_API_KEY is not set");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

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

function getStorageDirs() {
  const root = getProjectRoot();

  return Array.from(
    new Set([
      path.join(root, "public", "generated", "images"),
      path.join(root, ".next", "standalone", "public", "generated", "images"),
    ])
  );
}

function getImageMimeType(contentType: string | null) {
  if (!contentType) return "image/png";

  const normalized = contentType.toLowerCase();

  if (normalized.includes("jpeg") || normalized.includes("jpg")) {
    return "image/jpeg";
  }

  if (normalized.includes("webp")) {
    return "image/webp";
  }

  if (normalized.includes("gif")) {
    return "image/gif";
  }

  return "image/png";
}

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("gif")) return "gif";

  return "png";
}

async function writeImageToPublicStorage(buffer: Buffer, mimeType: string) {
  const ext = getExtensionFromMimeType(mimeType);
  const datePrefix = new Date().toISOString().slice(0, 10);
  const filename = `${datePrefix}-${crypto.randomUUID()}.${ext}`;
  const relativeUrl = `/generated/images/${filename}`;

  const writtenTo: string[] = [];

  for (const dir of getStorageDirs()) {
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);
    writtenTo.push(filePath);
  }

  console.log("[IMAGE STORAGE WRITTEN]", {
    url: relativeUrl,
    writtenTo,
  });

  return relativeUrl;
}

async function downloadImageToPublicUrl(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Generated image download failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const mimeType = getImageMimeType(response.headers.get("content-type"));

  return writeImageToPublicStorage(Buffer.from(arrayBuffer), mimeType);
}

export async function generateGapGptImage({
  model,
  prompt,
  size = "1024x1024",
}: GenerateGapGptImageArgs) {
  const baseUrl = getGapGptBaseUrl().replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: getGapGptHeaders(),
    body: JSON.stringify({
      model,
      prompt,
      size,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "GapGPT image generation failed");
  }

  const data = JSON.parse(text) as GapGptImageResponse;
  const firstImage = data.data?.[0];

  if (!firstImage?.url && !firstImage?.b64_json) {
    throw new Error("GapGPT image response has no image URL");
  }

  if (firstImage.b64_json) {
    const publicUrl = await writeImageToPublicStorage(
      Buffer.from(firstImage.b64_json, "base64"),
      "image/png"
    );

    return {
      model,
      originalUrl: null,
      url: publicUrl,
    };
  }

  const originalUrl = firstImage.url || "";
  const publicUrl = await downloadImageToPublicUrl(originalUrl);

  return {
    model,
    originalUrl,
    url: publicUrl,
  };
}
