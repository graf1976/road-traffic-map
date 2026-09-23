/**
 * ホーム画面追加（PWA）用のアイコン画像を生成する。
 *
 *   node scripts/generate-icons.mjs
 *
 * 生成物はリポジトリにコミット済み。デザインを変えたいときだけ実行する。
 */
import { mkdir, writeFile } from "node:fs/promises";

import sharp from "sharp";

/**
 * 角丸の背景に、道路（中央線）と信号の色を置いたロゴ。
 *
 * @param size  出力サイズ（正方形）
 * @param inset ロゴ本体の余白。maskable 用に安全領域へ収めるとき大きくする。
 * @param radius 背景の角丸（size に対する比率）
 */
function logoSvg({ size, inset, radius }) {
  const logoScale = (size - inset * 2) / 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * radius)}" fill="#0f172a" />
  <g transform="translate(${inset}, ${inset}) scale(${logoScale})">
    <path d="M11 28 L14 4 h4 l3 24 Z" fill="#475569" />
    <rect x="15" y="6" width="2" height="4" rx="1" fill="#f8fafc" />
    <rect x="15" y="13" width="2" height="4" rx="1" fill="#f8fafc" />
    <rect x="15" y="20" width="2" height="4" rx="1" fill="#f8fafc" />
    <circle cx="24" cy="9" r="3" fill="#ea4335" />
    <circle cx="24" cy="17" r="3" fill="#fbbc04" />
    <circle cx="24" cy="25" r="3" fill="#34a853" />
  </g>
</svg>`;
}

const TARGETS = [
  { file: "public/icons/icon-192.png", size: 192, inset: 0, radius: 0.22 },
  { file: "public/icons/icon-512.png", size: 512, inset: 0, radius: 0.22 },
  // maskable は端が切り取られるため、安全領域（中央 80%）に収まるよう余白を取る。
  { file: "public/icons/icon-maskable-512.png", size: 512, inset: 96, radius: 0.5 },
  // iOS のホーム画面用。角丸は OS 側で付くため四角のまま。
  { file: "src/app/apple-icon.png", size: 180, inset: 14, radius: 0 },
];

await mkdir("public/icons", { recursive: true });

for (const target of TARGETS) {
  const png = await sharp(Buffer.from(logoSvg(target))).png().toBuffer();
  await writeFile(target.file, png);
  console.log(`${target.file} (${target.size}x${target.size})`);
}

console.log(`\n${TARGETS.length}個のアイコンを生成しました。`);
