import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_DIR = path.resolve(__dirname, '../../../data/guides');

export function getAllGuides() {
  const files = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(GUIDES_DIR, f), 'utf-8');
    return JSON.parse(content);
  });
}

export function getGuideById(id) {
  const filePath = path.join(GUIDES_DIR, `${id}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function getGuideByPlatformId(platformId) {
  const guides = getAllGuides();
  return guides.find(g => g.platformId === platformId);
}
