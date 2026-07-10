// Bundle the demo into a single self-contained HTML file (dist/rook-demo.html).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

let html = read('demo/index.html');
// Function replacements: literal insertion, so `$` sequences in the sources
// are never interpreted as replacement patterns.
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${read('demo/styles.css')}\n</style>`);
html = html.replace('<script src="data.js"></script>', () => `<script>\n${read('demo/data.js')}\n</script>`);
html = html.replace('<script src="app.js"></script>', () => `<script>\n${read('demo/app.js')}\n</script>`);

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/rook-demo.html'), html);
console.log(`dist/rook-demo.html written (${(html.length / 1024).toFixed(1)} KB)`);
