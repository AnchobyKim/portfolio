import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '../../..');
const receiptPath = path.join(root, 'Portfolio/assets/ainvil/evidence/ainvil-04-verification.json');
const receipt = JSON.parse(await fs.readFile(receiptPath, 'utf8'));
let failed = 0;

for (const entry of receipt.files) {
  const abs = path.join(root, entry.path);
  try {
    const bytes = await fs.readFile(abs);
    const actual = crypto.createHash('sha256').update(bytes).digest('hex');
    const ok = actual === entry.sha256;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${entry.path}`);
  } catch (error) {
    failed++;
    console.log(`MISS  ${entry.path} (${error instanceof Error ? error.message : String(error)})`);
  }
}

if (failed) {
  console.error(`\nEvidence verification failed: ${failed} file(s) did not match.`);
  process.exitCode = 1;
} else {
  console.log(`\nEvidence verification passed: ${receipt.files.length} file(s) match the SHA-256 receipt.`);
}
