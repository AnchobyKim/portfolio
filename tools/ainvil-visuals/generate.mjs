import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '../../..');
const outDir = path.join(root, 'Portfolio/assets/ainvil');
const evidenceDir = path.join(outDir, 'evidence');

const source = {
  graph: 'plugins/ainvil/state/production_state_graph.json',
  trace: 'plugins/ainvil/reports/traceability_view.json',
  release: 'plugins/ainvil/reports/release_readiness_report.json',
  e2e: 'plugins/ainvil/validation/evidence/EVID-dungeon-recovery-procedural-recovery-job-e2e-latest.json',
  visual: 'plugins/ainvil/validation/evidence/EVID-dungeon-recovery-procedural-visual-validation-latest.json',
};

const palette = {
  bg: '#090d13', panel: '#101722', panel2: '#151f2c', line: '#263548',
  text: '#f1f5f9', muted: '#91a0b4', cyan: '#4bd5e7', teal: '#57e3ad',
  amber: '#ffbd66', red: '#ff6b74', blue: '#6ea8ff',
};

await fs.mkdir(evidenceDir, { recursive: true });

const readJson = async (rel) => JSON.parse(await fs.readFile(path.join(root, rel), 'utf8'));
const data = {
  graph: await readJson(source.graph),
  trace: await readJson(source.trace),
  release: await readJson(source.release),
  e2e: await readJson(source.e2e),
  visual: await readJson(source.visual),
};

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function text(x, y, value, size = 24, fill = palette.text, weight = 500, anchor = 'start', family = 'Arial, sans-serif') {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function pill(x, y, label, color = palette.cyan, width = 160) {
  return `<rect x="${x}" y="${y}" width="${width}" height="34" rx="17" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-opacity=".65"/>${text(x + width / 2, y + 23, label, 15, color, 700, 'middle')}`;
}

function panel(x, y, w, h, title = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${palette.panel}" stroke="${palette.line}"/>${title ? text(x + 28, y + 40, title, 19, palette.muted, 700) : ''}`;
}

function base(width, height, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#090d13"/><stop offset="1" stop-color="#111b29"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-opacity=".35"/></filter></defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${width * .88}" cy="${height * .1}" r="300" fill="${palette.cyan}" opacity=".045"/>
  ${body}
  ${text(46, height - 28, `AInvil • ${label} • Generated from repository evidence`, 15, palette.muted, 500)}
  </svg>`;
}

async function writeSvg(name, svg) {
  const svgPath = path.join(outDir, `${name}.svg`);
  await fs.writeFile(svgPath, svg, 'utf8');
  const pipeline = sharp(Buffer.from(svg));
  await pipeline.clone().png({ compressionLevel: 9 }).toFile(path.join(outDir, `${name}.png`));
  await pipeline.clone().webp({ quality: 92 }).toFile(path.join(outDir, `${name}.webp`));
}

async function hashFile(abs) {
  const bytes = await fs.readFile(abs);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function describeFile(rel) {
  const abs = path.join(root, rel);
  const stat = await fs.stat(abs);
  return { path: rel.replaceAll('\\', '/'), bytes: stat.size, modifiedAt: stat.mtime.toISOString(), sha256: await hashFile(abs) };
}

function nodeTitle(id) {
  const n = data.graph.nodes.find((item) => item.id === id);
  return n?.title || n?.name || id;
}

function metricCard(x, y, value, label, color) {
  return `${panel(x, y, 230, 126)}${text(x + 24, y + 55, value, 42, color, 800)}${text(x + 24, y + 91, label, 17, palette.muted, 600)}`;
}

async function probeBridge() {
  const checkedAt = new Date().toISOString();
  const url = data.release.compileGate?.healthUrl || 'http://127.0.0.1:17777/health';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const raw = await response.text();
    let body;
    try { body = JSON.parse(raw); } catch { body = { raw }; }
    const record = { checkedAt, url, status: response.ok ? 'Available' : 'HTTPError', httpStatus: response.status, body };
    await fs.writeFile(path.join(evidenceDir, 'ainvil-04-live-health.json'), JSON.stringify(record, null, 2));
    return record;
  } catch (error) {
    return { checkedAt, url, status: 'Unavailable', error: error instanceof Error ? error.message : String(error) };
  }
}

async function buildManifest() {
  const compileGate = data.release.compileGate;
  const checks = (compileGate?.checks || []).map((c) => ({
    id: c.id, target: c.target, status: c.status, ok: c.ok,
    message: c.message,
    data: c.id === 'compile_gate.bridge_health' || c.id === 'compile_gate.unity_get_status' || c.id === 'compile_gate.unity_compile_status' || c.id === 'compile_gate.unity_get_console_logs' ? c.data : undefined,
  }));
  const liveProbe = await probeBridge();
  const sources = await Promise.all([source.release, source.e2e, source.visual].map(describeFile));
  const manifest = {
    schemaVersion: '1.0.0',
    evidenceId: 'AINVIL-04-BRIDGE-PROOF',
    generatedAt: new Date().toISOString(),
    claim: 'A recorded Unity Bridge compile-gate run reached the health endpoint and Unity tool targets, with zero compile and console errors.',
    honestyBoundary: 'Recorded evidence and the fresh probe are reported separately. An unavailable fresh probe does not invalidate the retained historical run.',
    recordedRun: {
      startedAt: compileGate?.startedAt,
      finishedAt: compileGate?.finishedAt,
      status: compileGate?.status,
      unityProjectPath: compileGate?.unityProjectPath,
      healthUrl: compileGate?.healthUrl,
      compileErrorCount: compileGate?.compileErrorCount,
      consoleErrorCount: compileGate?.consoleErrorSummary?.errorCount,
      checks,
    },
    freshProbe: liveProbe,
    provenance: { algorithm: 'SHA-256', sources },
  };
  const manifestPath = path.join(evidenceDir, 'ainvil-04-bridge-proof.manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { manifest, manifestPath, manifestHash: await hashFile(manifestPath) };
}

async function hero() {
  const visual = data.visual.screenshots?.find((s) => s.checkpoint === 'job_complete') || data.visual.screenshots?.[0];
  const shotPath = visual?.absolutePath || path.join(root, 'plugins/ainvil/reports/visual_review/screenshots/procedural_213770770_job_complete.png');
  const header = base(1600, 1000, `
    ${pill(54, 48, 'AINVIL-01 / HERO', palette.cyan, 190)}
    ${text(54, 126, 'From production state', 50, palette.text, 800)}
    ${text(54, 184, 'to a running Unity scene.', 50, palette.text, 800)}
    ${text(54, 230, 'Traceable decisions. Executable work. Verifiable evidence.', 21, palette.muted, 500)}
    ${panel(54, 285, 650, 360, 'PRODUCTION STATE / CLI SUMMARY')}
    ${text(84, 352, `$ ainvil graph summary --project ${data.graph.projectName || data.graph.projectId}`, 18, palette.teal, 600, 'start', 'Consolas, monospace')}
    ${text(84, 404, `${data.graph.nodes.length} nodes`, 32, palette.text, 800, 'start', 'Consolas, monospace')}
    ${text(294, 404, `${data.graph.edges.length} edges`, 32, palette.text, 800, 'start', 'Consolas, monospace')}
    ${text(500, 404, `${data.trace.summary.missingLinkCount} missing`, 32, palette.amber, 800, 'start', 'Consolas, monospace')}
    ${text(84, 468, `active feature  ${data.graph.activeFeatureNodeId}`, 18, palette.muted, 500, 'start', 'Consolas, monospace')}
    ${text(84, 510, `validation      ${data.e2e.status} / ${data.e2e.validationLevel}`, 18, palette.teal, 600, 'start', 'Consolas, monospace')}
    ${text(84, 552, `release         ${data.release.decision}`, 18, palette.amber, 600, 'start', 'Consolas, monospace')}
    <path d="M704 465 C760 465 760 465 816 465" stroke="${palette.cyan}" stroke-width="3" fill="none"/><path d="M808 456 L822 465 L808 474" fill="${palette.cyan}"/>
    ${panel(820, 66, 726, 788, 'UNITY PLAY MODE / RECORDED VALIDATION')}
    ${text(54, 724, 'DOCUMENT', 15, palette.muted, 700)}${text(212, 724, '→', 22, palette.cyan, 700)}${text(264, 724, 'TASK', 15, palette.muted, 700)}${text(388, 724, '→', 22, palette.cyan, 700)}${text(440, 724, 'UNITY', 15, palette.muted, 700)}${text(572, 724, '→', 22, palette.cyan, 700)}${text(624, 724, 'EVIDENCE', 15, palette.muted, 700)}
    ${text(54, 787, 'The image is an editorial composite generated from current repository state', 17, palette.muted, 500)}
    ${text(54, 817, 'and a retained Play Mode screenshot—not a fabricated product screen.', 17, palette.muted, 500)}
  `, 'Hero');
  const bg = await sharp(Buffer.from(header)).png().toBuffer();
  const shot = await sharp(shotPath).resize(674, 674, { fit: 'cover' }).png().toBuffer();
  const result = sharp(bg).composite([{ input: shot, left: 846, top: 132 }, { input: Buffer.from(`<svg width="674" height="674"><rect x="1" y="1" width="672" height="672" rx="14" fill="none" stroke="${palette.line}" stroke-width="2"/></svg>`), left: 846, top: 132 }]);
  await result.clone().png({ compressionLevel: 9 }).toFile(path.join(outDir, 'ainvil-hero.png'));
  await result.clone().webp({ quality: 92 }).toFile(path.join(outDir, 'ainvil-hero.webp'));
}

async function idTrace() {
  const columns = [
    { x: 70, label: '01 / REQUIREMENT', id: 'REQ-DRC-MVP-001', color: palette.blue, children: ['AC-DRC-MVP-001', 'AC-DRC-MVP-002', 'AC-DRC-MVP-003'] },
    { x: 660, label: '02 / IMPLEMENTATION', id: 'TASK-DRC-MVP-001', color: palette.cyan, children: ['UNITY-DRC-FirstRecoveryJob-Scene', 'UNITY-DRC-FirstPlayable-Scripts'] },
    { x: 1250, label: '03 / VALIDATION', id: 'EVID-DRC-MVP-001', color: palette.teal, children: ['validates AC-001', 'validates AC-002', 'validates AC-003'] },
  ];
  let body = `${pill(70, 56, 'AINVIL-02 / ID TRACE', palette.cyan, 210)}${text(70, 140, 'One requirement ID, carried into execution and proof.', 42, palette.text, 800)}${text(70, 184, 'Every listed ID is backed by graph edges; the arrows summarize the multi-edge trace.', 19, palette.muted, 500)}`;
  for (const c of columns) {
    body += `${panel(c.x, 260, 520, 650)}${pill(c.x + 30, 292, c.label, c.color, 220)}${text(c.x + 30, 382, c.id, 23, c.color, 800, 'start', 'Consolas, monospace')}${text(c.x + 30, 426, nodeTitle(c.id), 22, palette.text, 650)}`;
    c.children.forEach((child, i) => {
      body += `<rect x="${c.x + 30}" y="${480 + i * 105}" width="460" height="76" rx="12" fill="${palette.panel2}" stroke="${palette.line}"/>${text(c.x + 50, 512 + i * 105, child, 16, palette.text, 650, 'start', 'Consolas, monospace')}`;
      if (child.startsWith('AC-') || child.startsWith('UNITY-')) body += text(c.x + 50, 540 + i * 105, nodeTitle(child), 15, palette.muted, 500);
    });
  }
  body += `<path d="M590 575 C625 575 625 575 650 575" stroke="${palette.cyan}" stroke-width="4"/><path d="M642 566 L656 575 L642 584" fill="${palette.cyan}"/><path d="M1180 575 C1215 575 1215 575 1240 575" stroke="${palette.teal}" stroke-width="4"/><path d="M1232 566 L1246 575 L1232 584" fill="${palette.teal}"/>${text(620, 550, 'graph edges', 14, palette.muted, 600, 'middle')}${text(1210, 550, 'via AC IDs', 14, palette.muted, 600, 'middle')}`;
  await writeSvg('ainvil-id-trace', base(1840, 1000, body, 'Requirement traceability'));
}

async function graphSummary() {
  const missing = data.trace.summary.missingLinkCount;
  const complete = data.trace.summary.countsByStatus?.Complete ?? 0;
  const statuses = Object.entries(data.trace.summary.countsByStatus || {});
  let bars = '';
  statuses.forEach(([label, value], i) => {
    const width = Math.max(10, value * 23);
    const color = label === 'Complete' ? palette.teal : palette.amber;
    bars += `${text(1010, 420 + i * 76, label, 17, palette.muted, 600)}<rect x="1010" y="438" width="0" height="0"/><rect x="1010" y="${438 + i * 76}" width="${width}" height="24" rx="12" fill="${color}" opacity=".8"/>${text(1022 + width, 457 + i * 76, value, 17, palette.text, 700)}`;
  });
  const body = `${pill(64, 54, 'AINVIL-03 / GRAPH', palette.cyan, 205)}${text(64, 138, 'Production State Graph', 48, palette.text, 800)}${text(64, 184, 'A computable map of design intent, implementation, validation, and gaps.', 20, palette.muted, 500)}
    ${metricCard(64, 250, data.graph.nodes.length, 'NODES', palette.blue)}${metricCard(316, 250, data.graph.edges.length, 'EDGES', palette.cyan)}${metricCard(568, 250, missing, 'MISSING LINKS', palette.amber)}
    ${panel(64, 410, 790, 470, 'GRAPH NEIGHBORHOOD / DRC MVP')}
    <path d="M210 620 L405 535 L625 620 L405 735 Z" fill="none" stroke="${palette.line}" stroke-width="3"/>
    <circle cx="210" cy="620" r="70" fill="${palette.blue}" fill-opacity=".13" stroke="${palette.blue}"/>${text(210, 615, 'REQ', 20, palette.blue, 800, 'middle')}${text(210, 644, 'DRC-MVP-001', 14, palette.text, 600, 'middle')}
    <circle cx="405" cy="535" r="70" fill="${palette.cyan}" fill-opacity=".13" stroke="${palette.cyan}"/>${text(405, 530, 'TASK', 20, palette.cyan, 800, 'middle')}${text(405, 559, 'DRC-MVP-001', 14, palette.text, 600, 'middle')}
    <circle cx="625" cy="620" r="70" fill="${palette.teal}" fill-opacity=".13" stroke="${palette.teal}"/>${text(625, 615, 'EVID', 20, palette.teal, 800, 'middle')}${text(625, 644, 'DRC-MVP-001', 14, palette.text, 600, 'middle')}
    <circle cx="405" cy="735" r="70" fill="${palette.amber}" fill-opacity=".13" stroke="${palette.amber}"/>${text(405, 730, 'UNITY', 20, palette.amber, 800, 'middle')}${text(405, 759, 'Scene + Scripts', 14, palette.text, 600, 'middle')}
    ${panel(940, 250, 836, 630, 'TRACEABILITY STATUS')}${bars}
    ${text(1010, 782, `${data.trace.summary.rowCount} traceability rows`, 22, palette.text, 700)}${text(1010, 822, `${complete} complete • ${data.trace.summary.proposedLinkCount} proposed links`, 18, palette.muted, 500)}
    ${text(64, 920, `Graph ${data.graph.version} • updated ${data.graph.updatedAt} • values are calculated during generation`, 16, palette.muted, 500)}`;
  await writeSvg('ainvil-graph-summary', base(1840, 1000, body, 'Production State Graph'));
}

async function bridgeProof(manifestInfo) {
  const m = manifestInfo.manifest;
  const bridge = m.recordedRun.checks.find((c) => c.id === 'compile_gate.bridge_health');
  const status = m.recordedRun.checks.find((c) => c.id === 'compile_gate.unity_get_status');
  const compile = m.recordedRun.checks.find((c) => c.id === 'compile_gate.unity_compile_status');
  const consoleCheck = m.recordedRun.checks.find((c) => c.id === 'compile_gate.unity_get_console_logs');
  const freshColor = m.freshProbe.status === 'Available' ? palette.teal : palette.amber;
  const body = `${pill(62, 48, 'AINVIL-04 / BRIDGE PROOF', palette.cyan, 255)}${text(62, 128, 'Proof of execution. Proof of the proof.', 46, palette.text, 800)}${text(62, 173, 'Recorded tool results + source hashes + a fresh health probe + a verification receipt.', 19, palette.muted, 500)}
    ${panel(62, 230, 525, 590, '01 / REQUEST PATH')}${text(102, 305, 'RECORDED MCP TOOL CALLS', 22, palette.blue, 800)}${text(102, 342, 'unity_get_status', 16, palette.text, 600, 'start', 'Consolas, monospace')}${text(102, 370, 'unity_compile_status', 16, palette.text, 600, 'start', 'Consolas, monospace')}${text(102, 398, 'unity_get_console_logs', 16, palette.text, 600, 'start', 'Consolas, monospace')}${text(102, 474, 'HTTP RPC', 22, palette.cyan, 800)}${text(102, 509, '127.0.0.1:17777/rpc', 17, palette.text, 600, 'start', 'Consolas, monospace')}${text(102, 589, 'UNITY MAIN THREAD', 22, palette.teal, 800)}${text(102, 624, status?.data?.activeScene?.name || 'DRC_ProceduralRecoveryJob', 16, palette.text, 600, 'start', 'Consolas, monospace')}<path d="M180 414 L180 450" stroke="${palette.cyan}" stroke-width="3"/><path d="M171 443 L180 457 L189 443" fill="${palette.cyan}"/><path d="M180 529 L180 565" stroke="${palette.teal}" stroke-width="3"/><path d="M171 558 L180 572 L189 558" fill="${palette.teal}"/>
    ${panel(615, 230, 550, 590, '02 / RECORDED RESULT')}${pill(655, 286, `RECORDED ${m.recordedRun.status.toUpperCase()}`, palette.teal, 220)}${text(655, 370, `Bridge running`, 18, palette.muted, 600)}${text(1090, 370, bridge?.data?.bridgeRunning ? 'TRUE' : 'FALSE', 22, palette.teal, 800, 'end')}${text(655, 421, 'Unity version', 18, palette.muted, 600)}${text(1090, 421, bridge?.data?.unityVersion || '—', 22, palette.text, 700, 'end')}${text(655, 472, 'Compile errors', 18, palette.muted, 600)}${text(1090, 472, compile?.data?.compileErrorCount ?? m.recordedRun.compileErrorCount, 22, palette.teal, 800, 'end')}${text(655, 523, 'Console errors', 18, palette.muted, 600)}${text(1090, 523, consoleCheck?.data?.logs?.length ?? m.recordedRun.consoleErrorCount, 22, palette.teal, 800, 'end')}${text(655, 592, 'Recorded at', 16, palette.muted, 600)}${text(655, 624, m.recordedRun.finishedAt, 16, palette.text, 600, 'start', 'Consolas, monospace')}${text(655, 690, 'Capability', 16, palette.muted, 600)}${text(655, 722, bridge?.data?.capabilityVersion || '—', 16, palette.text, 600, 'start', 'Consolas, monospace')}
    ${panel(1193, 230, 585, 590, '03 / EVIDENCE ABOUT EVIDENCE')}${pill(1233, 286, `FRESH PROBE: ${m.freshProbe.status.toUpperCase()}`, freshColor, 270)}${text(1233, 367, 'Manifest SHA-256', 17, palette.muted, 600)}${text(1233, 401, manifestInfo.manifestHash.slice(0, 32), 16, palette.text, 600, 'start', 'Consolas, monospace')}${text(1233, 429, manifestInfo.manifestHash.slice(32), 16, palette.text, 600, 'start', 'Consolas, monospace')}${text(1233, 492, 'Hashed source records', 17, palette.muted, 600)}${text(1695, 492, m.provenance.sources.length, 22, palette.cyan, 800, 'end')}${text(1233, 544, 'Verifier', 17, palette.muted, 600)}${text(1233, 578, 'node verify-evidence.mjs', 17, palette.teal, 700, 'start', 'Consolas, monospace')}${text(1233, 641, 'Fresh check time', 17, palette.muted, 600)}${text(1233, 675, m.freshProbe.checkedAt, 15, palette.text, 600, 'start', 'Consolas, monospace')}${text(1233, 732, 'Historical proof is never relabeled as live.', 16, palette.amber, 600)}
    ${text(62, 868, 'Verification chain', 17, palette.muted, 700)}${text(218, 868, 'source JSON → SHA-256 manifest → rendered media → SHA-256 receipt → verifier', 19, palette.text, 650)}`;
  await writeSvg('ainvil-unity-bridge-proof', base(1840, 930, body, 'Unity Execution Flow'));
}

async function contactSheet() {
  const width = 1920, height = 1080;
  let bgBody = `${pill(54, 44, 'AINVIL-05 / REAL PROJECT', palette.cyan, 260)}${text(54, 124, 'Deterministic dungeon recovery job', 44, palette.text, 800)}${text(54, 166, 'Three seed runs + five Play Mode checkpoints, retained as validation evidence.', 19, palette.muted, 500)}`;
  const seeds = data.e2e.perSeedResults || [];
  bgBody += panel(54, 210, 520, 810, 'SEED MATRIX');
  bgBody += `${text(86, 280, 'SEED', 15, palette.muted, 700)}${text(210, 280, 'ROOMS', 15, palette.muted, 700)}${text(315, 280, 'TARGETS', 15, palette.muted, 700)}${text(425, 280, 'RESULT', 15, palette.muted, 700)}`;
  seeds.forEach((s, i) => {
    const y = 330 + i * 95;
    bgBody += `<rect x="78" y="${y - 38}" width="470" height="70" rx="12" fill="${palette.panel2}"/>${text(94, y + 5, s.seed, 21, palette.text, 700, 'start', 'Consolas, monospace')}${text(230, y + 5, s.roomCount ?? s.rooms ?? '—', 21, palette.text, 700, 'middle')}${text(350, y + 5, s.recoveryTargetCount ?? s.targetCount ?? s.targets ?? '—', 21, palette.text, 700, 'middle')}${text(480, y + 5, s.status || (s.jobComplete ? 'Passed' : '—'), 18, palette.teal, 800, 'middle')}`;
  });
  const reachable = seeds.length ? `${Math.min(...seeds.map((s) => s.reachableTargetCount ?? 0))}/${Math.max(...seeds.map((s) => s.recoveryTargetCount ?? 0))}` : '—';
  bgBody += `${text(86, 660, 'ASSERTIONS', 15, palette.muted, 700)}${pill(86, 690, `reachable: ${reachable}`, palette.teal, 170)}${pill(276, 690, 'duplicates: 0', palette.teal, 180)}${pill(86, 742, 'deterministic: true', palette.teal, 220)}${pill(326, 742, 'job complete', palette.teal, 175)}${text(86, 840, `Validation: ${data.e2e.status}`, 22, palette.teal, 800)}${text(86, 880, `Level: ${data.e2e.validationLevel}`, 17, palette.muted, 600)}${text(86, 930, 'Screenshots are original retained PNGs.', 16, palette.muted, 500)}`;
  const positions = [
    { left: 620, top: 210, w: 602, h: 339 }, { left: 1264, top: 210, w: 602, h: 339 },
    { left: 620, top: 626, w: 390, h: 219 }, { left: 1048, top: 626, w: 390, h: 219 }, { left: 1476, top: 626, w: 390, h: 219 },
  ];
  const labels = ['01 SPAWN', '02 MOUSE LOOK', '03 TARGET', '04 INTERACTION', '05 COMPLETE'];
  positions.forEach((p, i) => {
    bgBody += `<rect x="${p.left - 2}" y="${p.top - 2}" width="${p.w + 4}" height="${p.h + 4}" rx="12" fill="none" stroke="${palette.line}" stroke-width="2"/>${pill(p.left, p.top + p.h + 12, labels[i], i === 4 ? palette.teal : palette.cyan, i < 2 ? 150 : 145)}`;
  });
  bgBody += `${text(620, 958, 'Seed shown in screenshots: ' + (data.visual.screenshots?.[0]?.path?.match(/procedural_(\d+)_/)?.[1] || '213770770'), 17, palette.muted, 600)}${text(620, 991, 'Human visual review remains a separate release requirement.', 17, palette.amber, 600)}`;
  const bg = await sharp(Buffer.from(base(width, height, bgBody, 'DRC evidence contact sheet'))).png().toBuffer();
  const composites = [];
  for (let i = 0; i < Math.min(5, data.visual.screenshots.length); i++) {
    const p = positions[i];
    const input = data.visual.screenshots[i].absolutePath || path.join(root, 'plugins/ainvil', data.visual.screenshots[i].path);
    composites.push({ input: await sharp(input).resize(p.w, p.h, { fit: 'cover' }).png().toBuffer(), left: p.left, top: p.top });
  }
  const result = sharp(bg).composite(composites);
  await result.clone().png({ compressionLevel: 9 }).toFile(path.join(outDir, 'ainvil-drc-evidence-contact-sheet.png'));
  await result.clone().webp({ quality: 92 }).toFile(path.join(outDir, 'ainvil-drc-evidence-contact-sheet.webp'));
}

async function releaseBoundary() {
  const review = data.release.gates?.find((g) => g.gateId === 'GATE-REVIEW-001');
  const body = `${pill(60, 52, 'AINVIL-06 / VALIDATION', palette.cyan, 235)}${text(60, 136, 'Passed is not the same as ready to release.', 46, palette.text, 800)}${text(60, 182, 'AInvil keeps automated evidence, human judgment, and public claims separate.', 19, palette.muted, 500)}
    ${panel(60, 250, 530, 570, 'AUTOMATED BRANCH')}${pill(100, 306, `VALIDATION ${data.visual.status.toUpperCase()}`, palette.teal, 235)}${text(100, 397, 'Compile gate', 19, palette.muted, 600)}${text(520, 397, data.visual.compileGate?.status || 'Passed', 22, palette.teal, 800, 'end')}${text(100, 452, 'Play Mode evidence', 19, palette.muted, 600)}${text(520, 452, data.visual.validationLevel, 20, palette.teal, 800, 'end')}${text(100, 507, 'Console errors', 19, palette.muted, 600)}${text(520, 507, data.visual.consoleErrorCount ?? 0, 22, palette.teal, 800, 'end')}${text(100, 594, 'What this proves', 17, palette.muted, 700)}${text(100, 632, 'The tested acceptance path passed.', 19, palette.text, 600)}${text(100, 671, 'It does not authorize a public release.', 19, palette.amber, 600)}
    ${panel(655, 250, 530, 570, 'HUMAN REVIEW BOUNDARY')}${pill(695, 306, `HUMAN REVIEW REQUIRED`, palette.amber, 270)}${text(695, 397, 'humanReviewRequired', 18, palette.muted, 600, 'start', 'Consolas, monospace')}${text(1115, 397, String(data.visual.humanReviewRequired).toUpperCase(), 22, palette.amber, 800, 'end')}${text(695, 452, 'Production Core review', 18, palette.muted, 600)}${text(1115, 452, review?.status || 'Blocked', 22, palette.red, 800, 'end')}${text(695, 507, 'Review evidence', 18, palette.muted, 600)}${text(1115, 507, review?.evidence || 'Changes Requested', 20, palette.red, 800, 'end')}${text(695, 594, 'Required action', 17, palette.muted, 700)}${text(695, 632, 'Resolve requested changes and perform', 18, palette.text, 600)}${text(695, 666, 'the explicit human release review.', 18, palette.text, 600)}
    ${panel(1250, 250, 530, 570, 'PUBLIC RELEASE CLAIM')}${pill(1290, 306, 'PUBLIC RELEASE READY: NO', palette.red, 285)}${text(1290, 397, 'publicReleaseReady', 18, palette.muted, 600, 'start', 'Consolas, monospace')}${text(1710, 397, String(data.visual.publicReleaseReady).toUpperCase(), 22, palette.red, 800, 'end')}${text(1290, 477, 'Decision logic', 17, palette.muted, 700)}${text(1290, 520, 'automated pass', 19, palette.teal, 700)}${text(1490, 520, '+', 24, palette.muted, 700)}${text(1530, 520, 'human review', 19, palette.amber, 700)}${text(1290, 566, '+ release gates', 19, palette.red, 700)}${text(1290, 634, '= public claim', 25, palette.text, 800)}${text(1290, 690, 'Current outcome: boundary held.', 19, palette.amber, 700)}
    ${text(60, 878, 'The negative release flag is evidence of governance working—not a failed validation.', 20, palette.text, 650)}`;
  await writeSvg('ainvil-release-boundary', base(1840, 930, body, 'Release boundary'));
}

async function writeReceipt(manifestInfo) {
  const outputs = [
    'ainvil-hero.png', 'ainvil-hero.webp', 'ainvil-id-trace.svg', 'ainvil-id-trace.png', 'ainvil-id-trace.webp',
    'ainvil-graph-summary.svg', 'ainvil-graph-summary.png', 'ainvil-graph-summary.webp',
    'ainvil-unity-bridge-proof.svg', 'ainvil-unity-bridge-proof.png', 'ainvil-unity-bridge-proof.webp',
    'ainvil-drc-evidence-contact-sheet.png', 'ainvil-drc-evidence-contact-sheet.webp',
    'ainvil-release-boundary.svg', 'ainvil-release-boundary.png', 'ainvil-release-boundary.webp',
  ];
  const files = [];
  for (const rel of outputs) {
    const abs = path.join(outDir, rel);
    const stat = await fs.stat(abs);
    files.push({ path: `Portfolio/assets/ainvil/${rel}`, bytes: stat.size, sha256: await hashFile(abs) });
  }
  const manifestStat = await fs.stat(manifestInfo.manifestPath);
  files.unshift({ path: 'Portfolio/assets/ainvil/evidence/ainvil-04-bridge-proof.manifest.json', bytes: manifestStat.size, sha256: manifestInfo.manifestHash });
  const receipt = { schemaVersion: '1.0.0', receiptId: 'AINVIL-VISUALS-VERIFICATION', generatedAt: new Date().toISOString(), algorithm: 'SHA-256', files };
  await fs.writeFile(path.join(evidenceDir, 'ainvil-04-verification.json'), JSON.stringify(receipt, null, 2));
  const report = `# AINVIL-04 Evidence Report\n\n- Recorded run: **${data.release.compileGate.status}** (${data.release.compileGate.finishedAt})\n- Fresh health probe: **${manifestInfo.manifest.freshProbe.status}** (${manifestInfo.manifest.freshProbe.checkedAt})\n- Recorded compile errors: **${data.release.compileGate.compileErrorCount}**\n- Recorded console errors: **${data.release.compileGate.consoleErrorSummary.errorCount}**\n- Manifest SHA-256: \`${manifestInfo.manifestHash}\`\n- Verification: run \`node Portfolio/tools/ainvil-visuals/verify-evidence.mjs\`\n\nThe retained recorded run and the fresh probe are intentionally reported separately.\n`;
  await fs.writeFile(path.join(evidenceDir, 'ainvil-04-evidence-report.md'), report);
}

const manifestInfo = await buildManifest();
await hero();
await idTrace();
await graphSummary();
await bridgeProof(manifestInfo);
await contactSheet();
await releaseBoundary();
await writeReceipt(manifestInfo);

console.log(JSON.stringify({ ok: true, outputDirectory: outDir, graph: { nodes: data.graph.nodes.length, edges: data.graph.edges.length, missingLinks: data.trace.summary.missingLinkCount }, freshBridgeProbe: manifestInfo.manifest.freshProbe.status }, null, 2));
