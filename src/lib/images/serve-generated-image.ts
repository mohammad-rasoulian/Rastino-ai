import fs from "fs/promises";
import path from "path";

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

function safeFilename(value: string) {
  const filename = path.basename(value);

  if (!/^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|gif)$/i.test(filename)) {
    return null;
  }

  return filename;
}

function getMimeType(filename: string) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";

  return "image/png";
}

function getCandidatePaths(filename: string) {
  const root = getProjectRoot();

  return [
    path.join(root, "public", "generated", "images", filename),
    path.join(root, ".next", "standalone", "public", "generated", "images", filename),
    path.join(process.cwd(), "public", "generated", "images", filename),
    path.join(process.cwd(), ".next", "standalone", "public", "generated", "images", filename),
  ];
}

export async function serveGeneratedImage(filenameValue: string) {
  const filename = safeFilename(filenameValue);

  if (!filename) {
    return Response.json(
      { error: "Invalid image filename" },
      { status: 400 }
    );
  }

  const candidates = Array.from(new Set(getCandidatePaths(filename)));

  for (const filePath of candidates) {
    try {
      const buffer = await fs.readFile(filePath);

      return new Response(buffer, {
        headers: {
          "Content-Type": getMimeType(filename),
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Rastino-Image-Path": filePath,
        },
      });
    } catch {
      // try next candidate
    }
  }

  return Response.json(
    {
      error: "Generated image not found",
      filename,
      checked: candidates,
    },
    { status: 404 }
  );
}
