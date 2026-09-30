/**
 * Phase 4/4.5 consistency: FastAPI response == frontend parser rules.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = process.env.VITE_API_URL || 'http://127.0.0.1:8001';
const TEST_IMAGE_DIR =
  process.env.TEST_IMAGE_DIR || path.resolve(__dirname, '../../docs/testdata');
const IMAGES = ['e.jpg', 'e3.jpg', 'e2.jpg', 'b.jpeg', 'e1.jpg', 'e4.jpg'];
const CLASS_ORDER = ['Damaged', 'Old', 'Ripe', 'Unripe'];

function approxEqual(a, b) {
  return Math.abs(a - b) <= 1e-6 + 1e-5 * Math.max(Math.abs(a), Math.abs(b));
}

/** Mirror frontend predictTomato parsing of verified FastAPI JSON */
function parseFrontend(data) {
  if (!data?.success || !data.prediction) {
    throw new Error('Unexpected API response shape');
  }
  const nested = data.prediction;
  const probabilities = {};
  for (const name of CLASS_ORDER) {
    const value = Number(nested.probabilities?.[name]);
    if (!Number.isFinite(value)) throw new Error(`Missing probability ${name}`);
    probabilities[name] = value;
  }
  return {
    class: nested.class,
    index: Number(nested.index),
    confidence: Number(nested.confidence),
    probabilities
  };
}

async function main() {
  const health = await fetch(`${API}/api/health`).then((r) => r.json());
  if (!(health.status === 'ok' && health.model_loaded)) {
    console.error('FAIL: /api/health', health);
    process.exit(1);
  }
  const info = await fetch(`${API}/api/model-info`).then((r) => r.json());
  console.log('API', API);
  console.log('TEST_IMAGE_DIR', TEST_IMAGE_DIR);
  console.log('model-info', info.model, info.classes?.join(','));
  console.log('Image | FastAPI | Frontend-parser | Match');
  console.log('-'.repeat(72));

  let allOk = true;
  for (const name of IMAGES) {
    const filePath = path.join(TEST_IMAGE_DIR, name);
    if (!fs.existsSync(filePath)) {
      console.log(`${name} | MISSING | MISSING | FAIL`);
      allOk = false;
      continue;
    }
    const bytes = fs.readFileSync(filePath);
    const form = new FormData();
    form.append('image', new Blob([bytes]), name);
    const res = await fetch(`${API}/api/predict`, { method: 'POST', body: form });
    const body = await res.json();
    if (!res.ok || !body.success) {
      console.log(`${name} | HTTP ${res.status} | — | FAIL`);
      allOk = false;
      continue;
    }
    const api = body.prediction;
    const fe = parseFrontend(body);
    const match =
      api.class === fe.class &&
      api.index === fe.index &&
      approxEqual(api.confidence, fe.confidence) &&
      CLASS_ORDER.every((c) => approxEqual(api.probabilities[c], fe.probabilities[c]));
    allOk = allOk && match;
    console.log(
      `${name} | ${api.class} (${api.confidence.toFixed(6)}) | ${fe.class} (${fe.confidence.toFixed(6)}) | ${match ? 'PASS' : 'FAIL'}`
    );
  }
  console.log('-'.repeat(72));
  console.log('OVERALL:', allOk ? 'PASS' : 'FAIL');
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
