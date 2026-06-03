/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const MANIFEST_ROOT = path.join(ROOT, "data", "student-books", "manifests");

function latestManualManifest() {
  if (!fs.existsSync(MANIFEST_ROOT)) return null;

  return fs
    .readdirSync(MANIFEST_ROOT)
    .filter((name) => name.startsWith("manual-books-") && name.endsWith(".json"))
    .map((name) => path.join(MANIFEST_ROOT, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("---- 1) Build manual manifest ----");
run("node", ["scripts/build-manual-student-books-manifest.js"]);

const manifest = latestManualManifest();

if (!manifest) {
  console.error("❌ Manual manifest not found.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(manifest, "utf8"));

if (!Array.isArray(data.books) || data.books.length === 0) {
  console.error("❌ No books found in manual folders.");
  console.error("Expected path example:");
  console.error("data/student-books/inbox/manual/grade-12/math/ریاضی/ریاضی ۳.pdf");
  process.exit(1);
}

console.log("\n---- 2) Import books ----");
console.log(`Manifest: ${path.relative(ROOT, manifest)}`);

run("node", ["scripts/import-student-books-batch.js", "--manifest", path.relative(ROOT, manifest)]);
