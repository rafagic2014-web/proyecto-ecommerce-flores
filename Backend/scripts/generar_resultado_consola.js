/* Genera artefactos reales de consola para el dashboard:
 *  1) Corre jest --runInBand (orden determinista) capturando stdout/stderr
 *     + --json --outputFile=reporte.json (misma corrida => reporte + consola alineados)
 *  2) Guarda el log crudo en Backend/reporte_consola.log
 *  3) Parsea bloques [TEST] en orden y los alinea con reporte.json
 *     (bloque N de la suite F <=> assertion N de la suite F)
 *  4) Escribe Backend/resultado_consola.json que el dashboard consume dinámico
 * Uso: npm run test:consola
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REPORTE = path.join(ROOT, "reporte.json");
const LOG_CRUDO = path.join(ROOT, "reporte_consola.log");
const SALIDA = path.join(ROOT, "resultado_consola.json");

function base(p) {
  return String(p || "").split(/[/\\]/).pop();
}

const r = spawnSync("npx", ["jest", "--runInBand", "--verbose", "--json", "--outputFile=reporte.json"],
  { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, shell: true });

const stdout = (r.stdout || "") + "\n" + (r.stderr || "");
fs.writeFileSync(LOG_CRUDO, stdout, "utf8");

// Solo líneas de consola de los tests (ignora resumen de jest)
const esContenido = (t) =>
  t.startsWith("[TEST]") || t.startsWith("Input:") ||
  t.startsWith("Variables evaluadas") || t.startsWith("✓") || t.startsWith("✗");

const bloques = [];
let actual = null;
let ultimoArchivo = null;
for (const raw of stdout.split(/\r?\n/)) {
  const t = raw.trim();
  if (!t || t === "console.log") continue;
  const m = t.match(/^at Object\.log \((.+?):\d+:\d+\)/);
  if (m) { ultimoArchivo = base(m[1]); continue; }
  if (!esContenido(t)) continue;
  if (t.startsWith("[TEST]")) {
    if (actual) { actual.archivo = ultimoArchivo; bloques.push(actual); }
    actual = { etiqueta: t, lineas: [t] };
  } else if (actual) {
    actual.lineas.push(t);
  }
}
if (actual) { actual.archivo = ultimoArchivo; bloques.push(actual); }

// Alinea con reporte.json (misma corrida)
const reporte = JSON.parse(fs.readFileSync(REPORTE, "utf8"));
const porSuite = {};
for (const s of reporte.testResults || []) {
  const f = base(s.name);
  porSuite[f] = porSuite[f] || [];
  for (const a of s.assertionResults || []) porSuite[f].push(a.title);
}
const usados = {};
const casos = {};
let sinMapear = 0;
for (const b of bloques) {
  if (!b.archivo || !porSuite[b.archivo]) { sinMapear++; continue; }
  const i = usados[b.archivo] || 0;
  const titulo = porSuite[b.archivo][i];
  usados[b.archivo] = i + 1;
  if (!titulo) { sinMapear++; continue; }
  const clave = `${b.archivo}::${titulo}`;
  const linea = (p) => b.lineas.find((l) => l.startsWith(p)) || "";
  casos[clave] = {
    etiqueta: b.etiqueta,
    input: linea("Input:"),
    variables: linea("Variables evaluadas"),
    output: linea("✓") || linea("✗") || ""
  };
}

fs.writeFileSync(SALIDA, JSON.stringify({
  generado: new Date().toISOString(),
  fuente: "jest --runInBand --verbose (stdout real, misma corrida que reporte.json)",
  totalBloques: bloques.length,
  totalMapeados: Object.keys(casos).length,
  sinMapear,
  casos
}, null, 2), "utf8");

console.log(`Bloques [TEST] detectados: ${bloques.length}`);
console.log(`Casos mapeados a reporte.json: ${Object.keys(casos).length} | sin mapear: ${sinMapear}`);
console.log(`OK -> ${SALIDA}`);
if (r.status !== 0) { console.log("AVISO: jest salió con código " + r.status); }
