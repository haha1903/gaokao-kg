import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';

// Only public assets enter the upload directory; server code and secrets stay out.
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'assets', 'physics', '404.html']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
// Version the paired homepage assets so cached styles cannot mismatch newly deployed markup.
let homepage = await readFile('dist/index.html', 'utf8');
for (const extension of ['css', 'js']) {
  const source = `assets/home.${extension}`;
  const content = await readFile(`dist/${source}`);
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const versioned = `assets/home.${hash}.${extension}`;
  await rename(`dist/${source}`, `dist/${versioned}`);
  homepage = homepage.replace(source, versioned);
}
await writeFile('dist/index.html', homepage);
await writeFile('dist/_routes.json', JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }));
await writeFile('dist/_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n');
console.log('Built public assets in dist/');
