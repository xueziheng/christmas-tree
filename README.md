# 🎄 Grand Luxury Interactive 3D Christmas Tree

> 一个基于 **React**, **Three.js (R3F)** 和 **AI 手势识别** 的高保真 3D 圣诞树 Web 应用。

这个项目不仅仅是一棵树，它是一个承载记忆的交互式画廊。成百上千个粒子、璀璨的彩灯和悬浮的拍立得照片共同组成了一棵奢华的圣诞树。用户可以通过手势控制树的形态（聚合/散开）和视角旋转，体验电影级的视觉盛宴。

**当圣诞树形成时，"圣诞节快乐"的粒子文字会从天空中飞入，正面朝向观众 2 秒后开始缓缓旋转。**

![Project Preview](public/preview.png)
*(注：建议在此处上传一张你的项目运行截图)*

## ✨ 核心特性

* **极致视觉体验**：由 15,000+ 个发光粒子组成的树身，配合动态光晕 (Bloom) 和辉光效果，营造梦幻氛围。
* **记忆画廊**：照片以"拍立得"风格悬浮在树上，每一张都是一个独立的发光体，支持双面渲染。
* **AI 手势控制**：无需鼠标，通过摄像头捕捉手势即可控制树的形态（聚合/散开）和视角旋转。
* **粒子文字效果**：圣诞树形成时，"圣诞节快乐"由数千个发光粒子飞入组成，带有彩虹渐变效果。
* **丰富细节**：包含动态闪烁的彩灯、飘落的金银火花、以及随机分布的圣诞礼物和糖果装饰。
* **高度可定制**：**支持用户轻松替换为自己的照片，并自由调整照片数量。**
* **移动端优化**：针对移动端进行了性能优化，减少粒子数量并禁用 AI 控制。

## 🛠️ 技术栈

* **框架**: React 18, Vite
* **3D 引擎**: React Three Fiber (Three.js)
* **工具库**: @react-three/drei, Maath
* **后期处理**: @react-three/postprocessing
* **AI 视觉**: MediaPipe Tasks Vision (Google)
* **图片优化**: Sharp (WebP 压缩)

## 🚀 快速开始

### 1. 环境准备
确保你的电脑已安装 [Node.js](https://nodejs.org/) (建议 v18 或更高版本)。

### 2. 安装依赖
在项目根目录下打开终端，运行：
```bash
npm install
```

### 3. 启动项目
```bash
npm run dev
```

### 4. 构建生产版本
```bash
npm run build
```

## 🖼️ 自定义照片

### 方式一：使用 Pexels API 自动下载（推荐）

项目包含了一个自动下载脚本，可以从 Pexels 获取高质量照片：

```bash
# 1. 设置 Pexels API Key（在 .env 文件中）
PEXELS_API_KEY=your_api_key_here

# 2. 运行下载脚本（会下载约 300 张圣诞/旅行主题照片）
node scripts/fetch-pexels.mjs

# 3. 压缩并转换为 WebP 格式
node scripts/compress-photos.mjs

# 4. Resize 到 600px 宽度（更小的文件）
node scripts/resize-compress-photos.mjs

# 5. 重命名文件为数字序列
node scripts/rename-photos.mjs
```

### 方式二：手动替换照片

找到项目目录下的 `public/photos/` 文件夹：

* **树顶照片**：命名为 `top.webp`（或 `top.jpg`）
* **树身照片**：命名为 `1.webp`, `2.webp`, `3.webp` ... 依次类推

**建议**：
* 使用正方形或 4:3 比例的图片
* 文件大小不宜过大（建议单张 500KB 以内）
* 推荐使用 WebP 格式以减小文件体积

### 修改照片数量

打开文件：`src/App.tsx`

找到大约第 12 行的代码：
```typescript
const TOTAL_PHOTOS = 133; // 修改这个数字为你实际的照片数量
```

## 🖐️ 手势控制说明

* **本项目内置了 AI 手势识别系统，请站在摄像头前进行操作**（屏幕右上角可查看 AI 状态）：

| 手势 | 动作 | 效果 |
|------|------|------|
| 🖐 张开手掌 | Disperse (散开) | 圣诞树炸裂成漫天飞舞的粒子和照片 |
| ✊ 握紧拳头 | Assemble (聚合) | 所有元素聚合成树，显示"圣诞节快乐"粒子文字 |
| 👋 手掌左右移动 | 旋转视角 | 手向左移，树向左转；手向右移，树向右转 |

## 📱 移动端说明

* 移动端会自动优化性能：
  * 减少粒子数量（4000 vs 15000）
  * 减少照片数量（50 vs 300）
  * 禁用 AI 手势控制（避免内存溢出）
  * 禁用后期处理效果（Bloom、Vignette）

## ⚙️ 进阶配置

如果你熟悉代码，可以在 `src/App.tsx` 中的 `CONFIG` 对象里调整更多视觉参数：

```typescript
const CONFIG = {
  colors: { ... }, // 修改树、灯光、边框的颜色
  counts: {
    foliage: 15000,   // 修改树叶粒子数量
    ornaments: 300,   // 修改悬挂的照片数量
    lights: 400       // 修改彩灯数量
  },
  tree: { height: 22, radius: 9 }, // 修改树的大小
  // ...
};
```

## 🌐 在线部署

本项目已部署到 Cloudflare Pages：
**[https://christmas-tree-1je.pages.dev/](https://christmas-tree-1je.pages.dev/)**

## 📄 License

MIT License. Feel free to use and modify for your own holiday celebrations!

---

## 🎄 Merry Christmas! ✨
