import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLATFORMS_DIR = path.resolve(__dirname, '../../../data/platforms');

export function getAllPlatforms() {
  const files = fs.readdirSync(PLATFORMS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(PLATFORMS_DIR, f), 'utf-8');
    return JSON.parse(content);
  });
}

export function getPlatformById(id) {
  const filePath = path.join(PLATFORMS_DIR, `${id}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}
