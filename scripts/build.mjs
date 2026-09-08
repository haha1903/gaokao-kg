import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

// Only public assets enter the upload directory; server code and secrets stay out.
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'assets', 'physics', '404.html']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
await writeFile('dist/_routes.json', JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }));
await writeFile('dist/_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n');
console.log('Built public assets in dist/');
