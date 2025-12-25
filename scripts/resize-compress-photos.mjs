import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.resolve(__dirname, "../public/photos");

// 配置
const MAX_WIDTH = 600;  // 最大宽度（圣诞树上显示很小，600px 足够）
const WEBP_QUALITY = 75; // WebP 质量 (0-100)

// 获取图片尺寸
async function getImageSize(imagePath) {
  const sharp = (await import("sharp")).default;
  const metadata = await sharp(imagePath).metadata();
  return { width: metadata.width, height: metadata.height };
}

// Resize 并转换为 WebP
async function resizeAndCompress(inputPath, outputPath, maxWidth) {
  const sharp = (await import("sharp")).default;
  await sharp(inputPath)
    .resize(maxWidth, null, { // 只限制宽度，高度按比例
      withoutEnlargement: true, // 不放大小图
      fit: 'inside'
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

// 获取文件大小
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2) + " KB";
}

async function main() {
  const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith(".webp"));

  console.log(`Found ${files.length} WebP photos to resize and recompress...`);
  console.log(`Target max width: ${MAX_WIDTH}px`);
  console.log(`WebP quality: ${WEBP_QUALITY}%\n`);

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  const toReplace = []; // 需要替换的文件列表

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(PHOTOS_DIR, file);
    const newPath = path.join(PHOTOS_DIR, `${file}.new`);

    const originalSize = fs.statSync(inputPath).size;
    const { width, height } = await getImageSize(inputPath);

    try {
      // 如果宽度已经小于等于目标宽度，跳过
      if (width <= MAX_WIDTH) {
        console.log(`[${i + 1}/${files.length}] ${file}`);
        console.log(`  Already small enough (${width}x${height}), skipping`);
        totalOriginalSize += originalSize;
        totalCompressedSize += originalSize;
        continue;
      }

      await resizeAndCompress(inputPath, newPath, MAX_WIDTH);

      const compressedSize = fs.statSync(newPath).size;
      const { width: newWidth, height: newHeight } = await getImageSize(newPath);
      const saved = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      totalOriginalSize += originalSize;
      totalCompressedSize += compressedSize;

      console.log(`[${i + 1}/${files.length}] ${file}`);
      console.log(`  ${width}x${height} -> ${newWidth}x${newHeight}`);
      console.log(`  ${getFileSize(inputPath)} -> ${getFileSize(newPath)} (-${saved}%)`);

      toReplace.push({ old: inputPath, new: newPath });

    } catch (err) {
      console.error(`  Error: ${err.message}`);
      // 清理临时文件
      if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    }
  }

  // 批量替换文件
  console.log(`\nReplacing ${toReplace.length} files...`);
  for (const { old, new: newPath } of toReplace) {
    try {
      fs.unlinkSync(old);
      fs.renameSync(newPath, old);
    } catch (err) {
      console.error(`  Error replacing ${old}: ${err.message}`);
    }
  }

  const totalSaved = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);
  console.log(`\nDone!`);
  console.log(`Total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB -> ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB (-${totalSaved}%)`);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
