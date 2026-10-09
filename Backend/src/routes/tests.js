// RUTAS DE TESTS 
const express = require('express');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const BACKEND_ROOT = path.join(__dirname, '..', '..');
const ARCHIVOS = {
  reporte: path.join(BACKEND_ROOT, 'reporte.json'),
  consola: path.join(BACKEND_ROOT, 'resultado_consola.json'),
  log: path.join(BACKEND_ROOT, 'reporte_consola.log')
};

let generando = false;

const infoArchivo = (ruta) => {
  try {
    const st = fs.statSync(ruta);
    return { existe: true, modificado: st.mtime.toISOString(), bytes: st.size };
  } catch (_) {
    return { existe: false };
  }
};

router.get('/estado', (req, res) => {
  res.json({
    generando,
    archivos: {
      reporte: infoArchivo(ARCHIVOS.reporte),
      consola: infoArchivo(ARCHIVOS.consola),
      log: infoArchivo(ARCHIVOS.log)
    }
  });
});

router.post('/recargar', (req, res) => {
  if (generando) {
    return res.status(429).json({ mensaje: 'Ya hay una generación en curso, espera a que termine' });
  }
  generando = true;

  execFile(
    process.execPath,
    [path.join(BACKEND_ROOT, 'scripts', 'generar_resultado_consola.js')],
    { cwd: BACKEND_ROOT, timeout: 240000, maxBuffer: 64 * 1024 * 1024 },
    (error, stdout, stderr) => {
      generando = false;
      if (error) {
        return res.status(500).json({
          mensaje: 'Falló la regeneración de los reportes',
          detalle: (stderr || error.message).slice(0, 1000)
        });
      }
      let resumen = {};
      try {
        resumen = JSON.parse(fs.readFileSync(ARCHIVOS.consola, 'utf8'));
      } catch (_) { /* el generador ya avisó en consola */ }
      res.json({
        mensaje: 'Reportes regenerados correctamente',
        tests: Object.keys(resumen.casos || {}).length,
        bloques: resumen.totalBloques ?? null,
        generado: resumen.generado ?? null,
        archivos: {
          reporte: infoArchivo(ARCHIVOS.reporte),
          consola: infoArchivo(ARCHIVOS.consola)
        }
      });
    }
  );
});

module.exports = router;
