import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.PEXELS_API_KEY || "RanJFKNMPBq8fHF8EDXCJLvrwVKaAaZiGnd6nSP0DX18dsZCsn3o77Em";
if (!API_KEY) {
  console.error("Missing PEXELS_API_KEY. Run: PEXELS_API_KEY=xxx node scripts/fetch-pexels.mjs");
  process.exit(1);
}

const OUT_DIR = path.resolve("public/photos");
const MANIFEST_PATH = path.resolve("public/photos.json");

// 方案1（圣诞/冬季氛围）+ 方案3（旅行风景）
const QUERIES = [
  // 方案1：氛围（150）
  ["christmas lights bokeh", 25],
  ["christmas ornaments", 20],
  ["gift wrapping", 15],
  ["cozy cabin snow", 20],
  ["snowy pine forest", 25],
  ["winter night street lights", 20],
  ["hot chocolate cozy", 15],
  ["fireplace cozy", 10],

  // 方案3：旅行（150）
  ["mountain sunrise landscape", 30],
  ["seascape sunset", 30],
  ["city skyline night", 25],
  ["road trip highway", 20],
  ["forest trail", 20],
  ["lake reflection mountains", 20],
  ["desert dunes", 5],
];

async function pexelsSearch(query, page, perPage) {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  if (!res.ok) throw new Error(`Pexels API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function downloadFile(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buf);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function pickBestSrc(photo) {
  // 使用 medium 尺寸以减小文件大小 (大约 350KB vs 1MB+)
  // medium: 1200x800, large: 1920x1280, large2x: 2560x1700
  return photo?.src?.medium || photo?.src?.small || photo?.src?.large2x;
}

async function main() {
  ensureDir(OUT_DIR);

  const manifest = [];
  const seen = new Set();

  for (const [query, target] of QUERIES) {
    let got = 0;
    let page = 1;

    while (got < target) {
      const perPage = Math.min(80, target - got);
      const data = await pexelsSearch(query, page, perPage);
      const photos = data.photos || [];
      if (photos.length === 0) break;

      for (const p of photos) {
        if (got >= target) break;
        if (seen.has(p.id)) continue;

        const imgUrl = pickBestSrc(p);
        if (!imgUrl) continue;

        const ext = ".jpg";
        const fileName = `${p.id}${ext}`;
        const relPath = `/photos/${fileName}`;
        const absPath = path.join(OUT_DIR, fileName);

        await downloadFile(imgUrl, absPath);

        manifest.push({
          id: p.id,
          theme: query,
          src: relPath,
          photographer: p.photographer,
          photographer_url: p.photographer_url,
          pexels_url: p.url,
        });

        seen.add(p.id);
        got += 1;
      }

      page += 1;
    }

    console.log(`Query "${query}": ${got}/${target}`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Done. Downloaded ${manifest.length} photos.`);
  console.log(`Photos: ${OUT_DIR}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
