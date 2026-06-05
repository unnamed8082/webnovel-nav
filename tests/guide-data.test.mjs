import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_DIR = path.resolve(__dirname, '../data/guides');
const PLATFORMS_DIR = path.resolve(__dirname, '../data/platforms');

describe('Guide Data', () => {
  const files = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.json'));

  it('should have at least one guide file', () => {
    assert.ok(files.length > 0, 'No guide files found');
  });

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(GUIDES_DIR, file), 'utf-8'));

    describe(`Guide: ${file}`, () => {
      it('should have required fields', () => {
        assert.ok(content.id, 'Missing id');
        assert.ok(content.platformId, 'Missing platformId');
        assert.ok(content.title, 'Missing title');
        assert.ok(content.summary, 'Missing summary');
        assert.ok(content.steps, 'Missing steps');
        assert.ok(content.lastChecked, 'Missing lastChecked');
      });

      it('should have valid id format', () => {
        assert.match(content.id, /^[a-z0-9-]+$/, `Invalid id: ${content.id}`);
      });

      it('should reference a valid platform', () => {
        const platformFile = path.join(PLATFORMS_DIR, `${content.platformId}.json`);
        assert.ok(fs.existsSync(platformFile), `Platform file not found: ${content.platformId}.json`);
      });

      it('should have non-empty steps array', () => {
        assert.ok(Array.isArray(content.steps), 'steps should be an array');
        assert.ok(content.steps.length > 0, 'steps should not be empty');
        for (const step of content.steps) {
          assert.ok(step.title, 'Step missing title');
          assert.ok(step.description, 'Step missing description');
        }
      });

      it('should have valid lastChecked date', () => {
        assert.match(content.lastChecked, /^\d{4}-\d{2}-\d{2}$/, `Invalid date: ${content.lastChecked}`);
      });

      it('should have valid faq if present', () => {
        if (content.faq) {
          assert.ok(Array.isArray(content.faq), 'faq should be an array');
          for (const item of content.faq) {
            assert.ok(item.question, 'FAQ missing question');
            assert.ok(item.answer, 'FAQ missing answer');
          }
        }
      });

      it('should have valid riskNotes if present', () => {
        if (content.riskNotes) {
          assert.ok(Array.isArray(content.riskNotes), 'riskNotes should be an array');
          for (const note of content.riskNotes) {
            assert.equal(typeof note, 'string', 'riskNotes items should be strings');
          }
        }
      });
    });
  }
});
