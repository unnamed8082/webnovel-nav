import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data/platforms');

// 读取所有平台数据文件
function loadAllPlatforms() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
    return { file: f, data: JSON.parse(content) };
  });
}

// 必填字段列表
const REQUIRED_FIELDS = [
  'id', 'name', 'shortName', 'url', 'type',
  'suitableGenres', 'incomeModels',
  'beginnerFriendlyScore', 'contractDifficulty',
  'description', 'lastChecked'
];

// 合法的平台类型
const VALID_TYPES = ['paid', 'free', 'mixed'];

// 合法的签约难度
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

describe('平台数据校验', () => {

  it('data/platforms 目录下至少有一个平台数据文件', () => {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    assert.ok(files.length > 0, '应该至少有一个平台 JSON 文件');
  });

  describe('每个平台数据文件的结构校验', () => {
    const platforms = loadAllPlatforms();

    for (const { file, data } of platforms) {
      describe(`平台: ${file}`, () => {

        it('包含所有必填字段', () => {
          for (const field of REQUIRED_FIELDS) {
            assert.ok(
              field in data,
              `缺少必填字段: ${field}`
            );
          }
        });

        it('id 是非空字符串', () => {
          assert.equal(typeof data.id, 'string');
          assert.ok(data.id.length > 0, 'id 不能为空');
        });

        it('name 是非空字符串', () => {
          assert.equal(typeof data.name, 'string');
          assert.ok(data.name.length > 0, 'name 不能为空');
        });

        it('type 是合法值', () => {
          assert.ok(
            VALID_TYPES.includes(data.type),
            `type "${data.type}" 不合法，应为 ${VALID_TYPES.join(', ')}`
          );
        });

        it('contractDifficulty 是合法值', () => {
          assert.ok(
            VALID_DIFFICULTIES.includes(data.contractDifficulty),
            `contractDifficulty "${data.contractDifficulty}" 不合法`
          );
        });

        it('beginnerFriendlyScore 在 1-5 范围内', () => {
          assert.equal(typeof data.beginnerFriendlyScore, 'number');
          assert.ok(data.beginnerFriendlyScore >= 1, '分数不能低于 1');
          assert.ok(data.beginnerFriendlyScore <= 5, '分数不能高于 5');
        });

        it('suitableGenres 是非空数组', () => {
          assert.ok(Array.isArray(data.suitableGenres));
          assert.ok(data.suitableGenres.length > 0, '至少有一个题材');
        });

        it('incomeModels 是非空数组', () => {
          assert.ok(Array.isArray(data.incomeModels));
          assert.ok(data.incomeModels.length > 0, '至少有一种收入模式');
        });

        it('url 是合法 URL', () => {
          assert.doesNotThrow(() => new URL(data.url), `"${data.url}" 不是合法 URL`);
        });

        it('lastChecked 是合法日期', () => {
          assert.ok(!isNaN(Date.parse(data.lastChecked)), 'lastChecked 不是合法日期');
        });

        it('pros 和 cons 是数组（如果存在）', () => {
          if (data.pros !== undefined) {
            assert.ok(Array.isArray(data.pros), 'pros 应该是数组');
          }
          if (data.cons !== undefined) {
            assert.ok(Array.isArray(data.cons), 'cons 应该是数组');
          }
        });

      });
    }
  });
});
