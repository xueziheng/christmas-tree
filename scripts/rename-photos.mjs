import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.resolve(__dirname, "../public/photos");

// 获取所有 jpg 和 webp 文件，按文件名排序
const jpgFiles = fs.readdirSync(PHOTOS_DIR)
  .filter(f => f.endsWith(".jpg"))
  .sort();

const webpFiles = fs.readdirSync(PHOTOS_DIR)
  .filter(f => f.endsWith(".webp"))
  .sort();

// top.jpg/top.webp 保持不变，放在最前面
const topJpg = jpgFiles.find(f => f === "top.jpg");
const topWebp = webpFiles.find(f => f === "top.webp");

// 剩下的文件（不包括 top.jpg）
const remainingJpg = jpgFiles.filter(f => f !== "top.jpg");
const remainingWebp = webpFiles.filter(f => f !== "top.webp");

// 临时映射：存储旧文件名到新文件名
const renameMap = [];

// 1. 先处理 top.jpg/top.webp (保持原样或重命名为 top.jpg/top.webp)
// 不需要重命名

// 2. 处理剩下的文件，按排序后的顺序重命名为 1.jpg, 2.jpg, ...
for (let i = 0; i < remainingWebp.length; i++) {
  const oldFile = remainingWebp[i];
  const newFile = `${i + 1}.webp`;
  renameMap.push({ old: oldFile, new: newFile });
}

console.log(`Found ${remainingWebp.length} photos to rename...`);
console.log("\nRename plan:");
renameMap.forEach(({ old, new: newName }, i) => {
  console.log(`  ${i + 1}. ${old} -> ${newName}`);
});

// 确认后执行重命名
console.log("\nRenaming WebP files...");
for (const { old, new: newName } of renameMap) {
  const oldPath = path.join(PHOTOS_DIR, old);
  const newPath = path.join(PHOTOS_DIR, newName);
  // 如果目标文件已存在，先删除
  if (fs.existsSync(newPath)) {
    fs.unlinkSync(newPath);
  }
  fs.renameSync(oldPath, newPath);
}

console.log(`\nDone! Renamed ${renameMap.length} files.`);
console.log(`\nNow you can delete the .jpg files:`);
console.log(`  cd public/photos && rm *.jpg`);
