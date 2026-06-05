#!/usr/bin/env node
/**
 * 平台数据校验脚本
 * 校验 data/platforms/ 下的所有 JSON 文件是否符合 schema
 *
 * 用法：npm run validate
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLATFORMS_DIR = path.resolve(__dirname, '../data/platforms');
const SCHEMA_PATH = path.resolve(__dirname, '../data/schema/platform.schema.json');

// 加载 schema
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));

// 颜色输出
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let totalErrors = 0;
let totalWarnings = 0;
let fileCount = 0;

/**
 * 校验单个平台数据文件
 */
function validatePlatform(filePath) {
  const filename = path.basename(filePath);
  const errors = [];
  const warnings = [];

  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(content);
  } catch (e) {
    errors.push(`JSON 解析失败: ${e.message}`);
    return { filename, errors, warnings };
  }

  // 校验必填字段
  for (const field of schema.required) {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`缺少必填字段: ${field}`);
    }
  }

  // 校验字段类型
  for (const [key, def] of Object.entries(schema.properties)) {
    const value = data[key];
    if (value === undefined || value === null) continue;

    // 类型检查
    if (def.type === 'string' && typeof value !== 'string') {
      errors.push(`${key} 应为字符串，实际为 ${typeof value}`);
    }
    if (def.type === 'integer' && !Number.isInteger(value)) {
      errors.push(`${key} 应为整数，实际为 ${typeof value}`);
    }
    if (def.type === 'array' && !Array.isArray(value)) {
      errors.push(`${key} 应为数组，实际为 ${typeof value}`);
    }

    // 枚举检查
    if (def.enum && !def.enum.includes(value)) {
      errors.push(`${key} 值 "${value}" 不在允许范围 [${def.enum.join(', ')}]`);
    }

    // 范围检查
    if (def.minimum !== undefined && value < def.minimum) {
      errors.push(`${key} 值 ${value} 小于最小值 ${def.minimum}`);
    }
    if (def.maximum !== undefined && value > def.maximum) {
      errors.push(`${key} 值 ${value} 大于最大值 ${def.maximum}`);
    }

    // URI 格式检查
    if (def.format === 'uri' && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        errors.push(`${key} "${value}" 不是有效的 URL`);
      }
    }

    // 日期格式检查
    if (def.format === 'date' && typeof value === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        errors.push(`${key} "${value}" 不是有效的日期格式 (YYYY-MM-DD)`);
      }
    }

    // 数组元素类型检查
    if (def.type === 'array' && Array.isArray(value) && def.items) {
      for (let i = 0; i < value.length; i++) {
        if (def.items.type === 'string' && typeof value[i] !== 'string') {
          errors.push(`${key}[${i}] 应为字符串，实际为 ${typeof value[i]}`);
        }
      }
    }
  }

  // ID 与文件名一致性检查
  if (data.id && filename !== `${data.id}.json`) {
    warnings.push(`文件名 "${filename}" 与 id "${data.id}" 不匹配`);
  }

  // 建议性检查（非强制）
  if (!data.pros || data.pros.length === 0) {
    warnings.push('缺少 pros（优点）字段');
  }
  if (!data.cons || data.cons.length === 0) {
    warnings.push('缺少 cons（缺点）字段');
  }
  if (!data.tags || data.tags.length === 0) {
    warnings.push('缺少 tags（标签）字段');
  }

  return { filename, errors, warnings };
}

// 主程序
console.log('\n📋 平台数据校验\n');

if (!fs.existsSync(PLATFORMS_DIR)) {
  console.error(`${RED}❌ 数据目录不存在: ${PLATFORMS_DIR}${RESET}`);
  process.exit(1);
}

const files = fs.readdirSync(PLATFORMS_DIR).filter(f => f.endsWith('.json'));

if (files.length === 0) {
  console.error(`${YELLOW}⚠️  未找到平台数据文件${RESET}`);
  process.exit(1);
}

for (const file of files) {
  const filePath = path.join(PLATFORMS_DIR, file);
  const result = validatePlatform(filePath);
  fileCount++;

  if (result.errors.length > 0) {
    console.log(`${RED}✗ ${result.filename}${RESET}`);
    for (const err of result.errors) {
      console.log(`  ${RED}ERROR: ${err}${RESET}`);
      totalErrors++;
    }
    for (const warn of result.warnings) {
      console.log(`  ${YELLOW}WARN:  ${warn}${RESET}`);
      totalWarnings++;
    }
  } else if (result.warnings.length > 0) {
    console.log(`${YELLOW}⚠ ${result.filename}${RESET}`);
    for (const warn of result.warnings) {
      console.log(`  ${YELLOW}WARN:  ${warn}${RESET}`);
      totalWarnings++;
    }
  } else {
    console.log(`${GREEN}✓ ${result.filename}${RESET}`);
  }
}

// 汇总
console.log('\n' + '─'.repeat(40));
console.log(`文件数: ${fileCount}`);
console.log(`${RED}错误:   ${totalErrors}${RESET}`);
console.log(`${YELLOW}警告:   ${totalWarnings}${RESET}`);

if (totalErrors > 0) {
  console.log(`\n${RED}❌ 校验失败${RESET}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}✅ 校验通过${RESET}`);
  process.exit(0);
}
