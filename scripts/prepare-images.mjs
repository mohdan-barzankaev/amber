import sharp from 'sharp';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const images = JSON.parse(await readFile('assets/menu/manifest.json', 'utf8'));
await mkdir('public/images', { recursive: true });
await Promise.all(
  images.map(async ({ id, file }) => {
    await sharp(file)
      .rotate()
      .resize(720, 720, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(`public/images/${id}.webp`);
  }),
);
const logo = await readFile('assets/brand/amber-logo.svg', 'utf8');
const mark = logo
  .replace(/<g fill="#F8F0C5"[\s\S]*?<\/g>/, '')
  .replace('viewBox="0 0 600 600"', 'viewBox="245 138 110 140"')
  .replace(/<circle[^>]*\/>/, '');
await writeFile('public/brand/amber-mark.svg', mark);
await writeFile(
  'public/favicon.svg',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#703414"/><path d="M17 47 32 16 47 47M24 35h16" fill="none" stroke="#F8F0C5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
);
console.log(`Prepared ${images.length} menu images and brand assets.`);
