import sharp from 'sharp';

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#010a13"/>
  <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#c89b3c" stroke-width="4"/>
  <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" fill="none" stroke="#c89b3c" stroke-width="2" opacity="0.5"/>
  <text x="50" y="58" font-family="Arial" font-size="32" font-weight="bold" fill="#c89b3c" text-anchor="middle">LoL</text>
</svg>`;

const svgBuf = Buffer.from(svgIcon);

await sharp(svgBuf).resize(192, 192).png().toFile('public/pwa-192x192.png');
console.log('192x192 done');

await sharp(svgBuf).resize(512, 512).png().toFile('public/pwa-512x512.png');
console.log('512x512 done');

await sharp(svgBuf).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('apple-touch-icon done');

console.log('All icons generated!');
