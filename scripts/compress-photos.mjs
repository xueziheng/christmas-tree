import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.resolve(__dirname, "../public/photos");

// WebP 压缩质量 (0-100)
const QUALITY = 75;

// 检查是否安装了 cwebp
function checkCwebp() {
  try {
    execSync("cwebp -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// 使用 sharp 压缩 (Node.js 原生方案)
async function compressWithSharp(inputPath, outputPath) {
  // 动态导入 sharp
  const sharp = (await import("sharp")).default;
  await sharp(inputPath)
    .webp({ quality: QUALITY })
    .toFile(outputPath);
}

// 使用 cwebp 压缩 (需要安装 libwebp)
function compressWithCwebp(inputPath, outputPath) {
  execSync(`cwebp -q ${QUALITY} "${inputPath}" -o "${outputPath}"`, { stdio: "ignore" });
}

// 获取文件大小
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2) + " KB";
}

async function main() {
  const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith(".jpg"));

  console.log(`Found ${files.length} photos to compress...`);

  // 检查使用哪种压缩方式
  let useCwebp = checkCwebp();
  let compressFn;

  if (useCwebp) {
    console.log("Using cwebp for compression (faster)...\n");
    compressFn = compressWithCwebp;
  } else {
    console.log("cwebp not found. Using sharp (Node.js)...");
    console.log("For faster compression, install libwebp:\n");
    console.log("  Windows: choco install libwebp");
    console.log("  macOS: brew install webp");
    console.log("  Linux: apt install webp\n");
    compressFn = compressWithSharp;
  }

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(PHOTOS_DIR, file);
    const outputPath = path.join(PHOTOS_DIR, file.replace(".jpg", ".webp"));

    const originalSize = fs.statSync(inputPath).size;

    try {
      await compressFn(inputPath, outputPath);

      const compressedSize = fs.statSync(outputPath).size;
      const saved = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      totalOriginalSize += originalSize;
      totalCompressedSize += compressedSize;

      console.log(`[${i + 1}/${files.length}] ${file}`);
      console.log(`  ${getFileSize(inputPath)} -> ${getFileSize(outputPath)} (-${saved}%)`);
    } catch (err) {
      console.error(`  Error compressing ${file}:`, err.message);
    }
  }

  const totalSaved = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);
  console.log(`\nDone!`);
  console.log(`Total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB -> ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB (-${totalSaved}%)`);
  console.log(`\nNext steps:`);
  console.log(`1. Verify the WebP images look correct`);
  console.log(`2. Delete .jpg files:`);
  console.log(`   cd public/photos && rm *.jpg`);
  console.log(`3. Update App.tsx to use .webp extension`);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
