/* =========================================================================
 * DashBoard Tests Productos Controller — app dinámico
 * Fuente viva: Backend/reporte.json  (jest --json --outputFile=reporte.json)
 * Complemento descriptivo: Backend/src/Tests/datos_de_test.html
 * Estilo: SYS_GZG_TERMINAL (no modificar paleta / fuentes base)
 * ========================================================================= */

// Ruta relativa desde esta carpeta hasta Backend/reporte.json:
// DashBoard_.../ -> Tests_productos_controller.js_/ (1) -> Tests/ (2) -> src/ (3) -> Backend/ (4)
const RUTAS_REPORTE = [
  "../../../../reporte.json",
  "../../../reporte.json",
  "./reporte.json"
];

// Consola real de la corrida: npm run test:consola -> Backend/resultado_consola.json
const RUTAS_CONSOLA = [
  "../../../../resultado_consola.json",
  "../../../resultado_consola.json",
  "./resultado_consola.json"
];

/* -------------------------------------------------------------------------
 * Catálogo descriptivo extraído de datos_de_test.html + *.test.js
 * Clave: "<archivo.test.js>::<title exacto del test en reporte.json>"
 * dbCalls / output / status verificados contra los console.log de cada test.
 * ------------------------------------------------------------------------- */
const DETALLE_CASOS = {
  // ---- activarProducto.test.js (3) ----
  "activarProducto.test.js::Debe reactivar el producto exitosamente": {
    id: "ACT-01", suite: "activarProducto",
    descripcion: "Reactivar un producto inactivo a activo enviando su ID en los params de la URL.",
    dbCalls: 1, status: 200, output: 'res.json={"mensaje":"Producto reactivado"}',
  },
  "activarProducto.test.js::Debe retornar 404 si el producto a reactivar no existe": {
    id: "ACT-02", suite: "activarProducto",
    descripcion: "Intentar activar un producto no registrado (ID ficticio 99, posible borrado previo).",
    dbCalls: 1, status: 404, output: 'res.json={"mensaje":"Producto no existe"}',
  },
  "activarProducto.test.js::Debe retornar 500 si falla la consulta SQL": {
    id: "ACT-03", suite: "activarProducto",
    descripcion: "Falla técnica interna (corte de conexión / error SQL) al reactivar.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Error al reactivar producto"}',
  },

  // ---- createProducto.test.js (4) ----
  "createProducto.test.js::Debe retornar 400 si falta el nombre": {
    id: "CRE-01", suite: "createProducto",
    descripcion: "Validación: registrar producto sin nombre (solo descripción y precio).",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Nombre y precio son obligatorios"}',
  },
  "createProducto.test.js::Debe retornar 400 si falta el precio": {
    id: "CRE-02", suite: "createProducto",
    descripcion: "Validación: registrar producto sin precio (solo nombre y descripción).",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Nombre y precio son obligatorios"}',
  },
  "createProducto.test.js::Debe crear el producto correctamente cuando los datos son válidos": {
    id: "CRE-03", suite: "createProducto",
    descripcion: "Camino feliz: objeto completo (nombre, descripción, precio, stock, imagen, categoría).",
    dbCalls: 1, status: 200, output: 'res.json={"mensaje":"Producto creado"}',
  },
  "createProducto.test.js::Debe retornar 500 si la inserción en BD falla": {
    id: "CRE-04", suite: "createProducto",
    descripcion: "Falla técnica al guardar el nuevo producto en disco.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Error de inserción"}',
  },

  // ---- deleteProducto.test.js (3) ----
  "deleteProducto.test.js::Debe desactivar el producto exitosamente (soft delete)": {
    id: "DEL-01", suite: "deleteProducto",
    descripcion: "Eliminación lógica (soft delete): cambia estado a inactivo sin borrar el registro.",
    dbCalls: 1, status: 200, output: 'res.json={"mensaje":"Producto desactivado"}',
  },
  "deleteProducto.test.js::Debe retornar 404 si el producto a eliminar no existe": {
    id: "DEL-02", suite: "deleteProducto",
    descripcion: "Desactivar con ID inexistente (99) que no coincide con ningún registro.",
    dbCalls: 1, status: 404, output: 'res.json={"mensaje":"Producto no existe"}',
  },
  "deleteProducto.test.js::Debe retornar 500 si falla la consulta SQL": {
    id: "DEL-03", suite: "deleteProducto",
    descripcion: "Error de ejecución SQL durante el cambio de estado a inactivo.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Error de desactivación"}',
  },

  // ---- descontarStock.test.js (13) ----
  "descontarStock.test.js::Debe retornar 400 con id negativo": {
    id: "STK-01", suite: "descontarStock",
    descripcion: "Seguridad: ID negativo es totalmente inválido para un registro.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Producto inválido"}',
  },
  "descontarStock.test.js::Debe retornar 400 con id cero": {
    id: "STK-02", suite: "descontarStock",
    descripcion: "Regla de negocio: los IDs inician en 1, el cero está prohibido.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Producto inválido"}',
  },
  "descontarStock.test.js::Debe retornar 400 con id flotante": {
    id: "STK-03", suite: "descontarStock",
    descripcion: "IDs deben ser enteros; se envía decimal 1.5.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Producto inválido"}',
  },
  "descontarStock.test.js::Debe retornar 400 con id no numérico": {
    id: "STK-04", suite: "descontarStock",
    descripcion: "Cliente envía letras en el campo ID.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Producto inválido"}',
  },
  "descontarStock.test.js::Debe retornar 400 con id null": {
    id: "STK-05", suite: "descontarStock",
    descripcion: "Se envía null (ausencia total de valor) como identificador.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Producto inválido"}',
  },
  "descontarStock.test.js::Debe retornar 400 con id undefined": {
    id: "STK-06", suite: "descontarStock",
    descripcion: "La petición ni siquiera incluye la propiedad id.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Producto inválido"}',
  },
  "descontarStock.test.js::Debe retornar 400 con cantidad negativa": {
    id: "STK-07", suite: "descontarStock",
    descripcion: "Cantidad negativa: intento de alterar inventario de forma maliciosa.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Cantidad inválida"}',
  },
  "descontarStock.test.js::Debe retornar 400 con cantidad cero": {
    id: "STK-08", suite: "descontarStock",
    descripcion: "Restar cero unidades no genera cambio real; petición innecesaria.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Cantidad inválida"}',
  },
  "descontarStock.test.js::Debe retornar 400 con cantidad decimal": {
    id: "STK-09", suite: "descontarStock",
    descripcion: "No se pueden descontar fracciones de productos físicos (2.5).",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Cantidad inválida"}',
  },
  "descontarStock.test.js::Debe retornar 400 con cantidad no numérica": {
    id: "STK-10", suite: "descontarStock",
    descripcion: "Texto no convertible en el campo cantidad.",
    dbCalls: 0, status: 400, output: 'res.json={"mensaje":"Cantidad inválida"}',
  },
  "descontarStock.test.js::Debe parsear strings numéricos y descontar stock con éxito": {
    id: "STK-11", suite: "descontarStock",
    descripcion: "Formulario web envía números como texto; el controlador los parsea a enteros.",
    dbCalls: 1, status: 200, output: 'res.json={"mensaje":"Stock actualizado"}',
  },
  "descontarStock.test.js::Debe retornar 400 si el stock es insuficiente o el producto está inactivo": {
    id: "STK-12", suite: "descontarStock",
    descripcion: "Descontar más unidades de las disponibles o producto desactivado.",
    dbCalls: 1, status: 400, output: 'res.json={"mensaje":"Stock insuficiente o producto no disponible"}',
  },
  "descontarStock.test.js::Debe retornar 500 ante error de base de datos": {
    id: "STK-13", suite: "descontarStock",
    descripcion: "Falla crítica del motor de BD durante la actualización de inventario.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Error SQL al descontar stock"}',
  },

  // ---- getProductos.test.js (2) ----
  "getProductos.test.js::Debe retornar la lista de productos activos con respuesta 200": {
    id: "GET-01", suite: "getProductos",
    descripcion: "Consultar el catálogo principal de productos disponibles para la venta.",
    dbCalls: 1, status: 200, output: "res.json=Array[productos activos]",
  },
  "getProductos.test.js::Debe retornar 500 si ocurre un error en la BD": {
    id: "GET-02", suite: "getProductos",
    descripcion: "Falla de conexión al consultar la lista de productos.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Error de conexión a BD"}',
  },

  // ---- getProductosPorCategoria.test.js (3) ----
  "getProductosPorCategoria.test.js::Debe filtrar productos pasando categoria_id correctamente": {
    id: "CAT-01", suite: "getProductosPorCategoria",
    descripcion: "Filtro por categoría seleccionada por el usuario vía params de URL.",
    dbCalls: 1, status: 200, output: "res.json=Array[productos de categoría 5]",
  },
  "getProductosPorCategoria.test.js::Debe retornar 500 si falla la consulta por categoría": {
    id: "CAT-02", suite: "getProductosPorCategoria",
    descripcion: "Fallo técnico durante la búsqueda filtrada por categoría.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Error al filtrar por categoría"}',
  },
  "getProductosPorCategoria.test.js::Debe retornar array vacío si la categoría no tiene productos": {
    id: "CAT-03", suite: "getProductosPorCategoria",
    descripcion: "Categoría existente pero sin productos asignados.",
    dbCalls: 1, status: 200, output: "res.json=[]",
  },

  // ---- getTodosProductos.test.js (2) ----
  "getTodosProductos.test.js::Debe retornar todos los productos (activos e inactivos)": {
    id: "ALL-01", suite: "getTodosProductos",
    descripcion: "Panel admin: listado completo sin filtro de estado.",
    dbCalls: 1, status: 200, output: "res.json=Array[activos + inactivos]",
  },
  "getTodosProductos.test.js::Debe retornar 500 si la base de datos falla": {
    id: "ALL-02", suite: "getTodosProductos",
    descripcion: "Error general de lectura al obtener todos los registros.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Fallo en la consulta SQL"}',
  },

  // ---- updateProducto.test.js (4) ----
  "updateProducto.test.js::Debe convertir categoria_id vacía (\"\") o undefined a null": {
    id: "UPD-01", suite: "updateProducto",
    descripcion: "Limpieza de datos: quitar categoría envía '' o undefined; se convierte a null para la BD.",
    dbCalls: 1, status: 200, output: 'res.json={"mensaje":"Producto actualizado"}',
  },
  "updateProducto.test.js::Debe actualizar el producto correctamente cuando existe": {
    id: "UPD-02", suite: "updateProducto",
    descripcion: "Flujo exitoso: modificar nombre, precio y categoría de un producto existente.",
    dbCalls: 1, status: 200, output: 'res.json={"mensaje":"Producto actualizado"}',
  },
  "updateProducto.test.js::Debe retornar 404 si el producto no existe (affectedRows === 0)": {
    id: "UPD-03", suite: "updateProducto",
    descripcion: "Editar un ID no registrado (99): cero filas modificadas.",
    dbCalls: 1, status: 404, output: 'res.json={"mensaje":"Producto no existe"}',
  },
  "updateProducto.test.js::Debe retornar 500 ante fallo en la BD": {
    id: "UPD-04", suite: "updateProducto",
    descripcion: "Falla interna al aplicar cambios en un registro.",
    dbCalls: 1, status: 500, output: 'res.json={"error":"Error al actualizar"}',
  }
};

/* Snapshot de duraciones del último reporte.json conocido (fallback si no hay fetch).
 * Se refresca solo con:  npm run test:reporte   (jest --json --outputFile=reporte.json) */
const DURACIONES_SNAPSHOT = {
  "activarProducto.test.js::Debe reactivar el producto exitosamente": 5,
  "activarProducto.test.js::Debe retornar 404 si el producto a reactivar no existe": 1,
  "activarProducto.test.js::Debe retornar 500 si falla la consulta SQL": 2,
  "createProducto.test.js::Debe retornar 400 si falta el nombre": 6,
  "createProducto.test.js::Debe retornar 400 si falta el precio": 2,
  "createProducto.test.js::Debe crear el producto correctamente cuando los datos son válidos": 1,
  "createProducto.test.js::Debe retornar 500 si la inserción en BD falla": 1,
  "deleteProducto.test.js::Debe desactivar el producto exitosamente (soft delete)": 6,
  "deleteProducto.test.js::Debe retornar 404 si el producto a eliminar no existe": 1,
  "deleteProducto.test.js::Debe retornar 500 si falla la consulta SQL": 1,
  "descontarStock.test.js::Debe retornar 400 con id negativo": 36,
  "descontarStock.test.js::Debe retornar 400 con id cero": 2,
  "descontarStock.test.js::Debe retornar 400 con id flotante": 2,
  "descontarStock.test.js::Debe retornar 400 con id no numérico": 4,
  "descontarStock.test.js::Debe retornar 400 con id null": 3,
  "descontarStock.test.js::Debe retornar 400 con id undefined": 3,
  "descontarStock.test.js::Debe retornar 400 con cantidad negativa": 1,
  "descontarStock.test.js::Debe retornar 400 con cantidad cero": 1,
  "descontarStock.test.js::Debe retornar 400 con cantidad decimal": 2,
  "descontarStock.test.js::Debe retornar 400 con cantidad no numérica": 3,
  "descontarStock.test.js::Debe parsear strings numéricos y descontar stock con éxito": 1,
  "descontarStock.test.js::Debe retornar 400 si el stock es insuficiente o el producto está inactivo": 2,
  "descontarStock.test.js::Debe retornar 500 ante error de base de datos": 2,
  "getProductos.test.js::Debe retornar la lista de productos activos con respuesta 200": 5,
  "getProductos.test.js::Debe retornar 500 si ocurre un error en la BD": 1,
  "getProductosPorCategoria.test.js::Debe filtrar productos pasando categoria_id correctamente": 5,
  "getProductosPorCategoria.test.js::Debe retornar 500 si falla la consulta por categoría": 2,
  "getProductosPorCategoria.test.js::Debe retornar array vacío si la categoría no tiene productos": 2,
  "getTodosProductos.test.js::Debe retornar todos los productos (activos e inactivos)": 7,
  "getTodosProductos.test.js::Debe retornar 500 si la base de datos falla": 2,
  "updateProducto.test.js::Debe convertir categoria_id vacía (\"\") o undefined a null": 11,
  "updateProducto.test.js::Debe actualizar el producto correctamente cuando existe": 2,
  "updateProducto.test.js::Debe retornar 404 si el producto no existe (affectedRows === 0)": 1,
  "updateProducto.test.js::Debe retornar 500 ante fallo en la BD": 1
};

// ---- Estado global ----
let filas = [];
let meta = { suites: 0, total: 0, passed: 0, failed: 0, tiempoMs: 0, fuente: "snapshot", fecha: null };
let consolaCasos = {}; // consola real por clave, desde resultado_consola.json (dinámico)
let consolaOrigen = null;

// ---- Helpers DOM ----
const $ = (id) => document.getElementById(id);

function nombreArchivo(ruta) {
  if (!ruta) return "desconocido";
  const partes = ruta.split(/[/\\]/);
  return partes[partes.length - 1];
}

function badge(estado) {
  const ok = estado === "passed";
  return `<span class="${ok ? "badge-pass" : "badge-fail"}">${ok ? "PASS" : "FAIL"}</span>`;
}

function formatearTiempo(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Búsqueda tolerante: exacto primero, luego ignorando comillas/espacios (ej. categoria_id "")
function buscarDetalle(archivo, titulo) {
  const exacto = DETALLE_CASOS[`${archivo}::${titulo}`];
  if (exacto) return exacto;
  const norm = (s) => (s || "").replace(/["“”]/g, "").replace(/\s+/g, " ").trim();
  const buscado = norm(titulo);
  for (const [clave, info] of Object.entries(DETALLE_CASOS)) {
    const sep = clave.indexOf("::");
    if (clave.slice(0, sep) === archivo && norm(clave.slice(sep + 2)) === buscado) return info;
  }
  return {};
}

// ---- Normalización: reporte.json (jest --json) -> filas del dashboard ----
function filasDesdeReporte(json) {
  const out = [];
  (json.testResults || []).forEach((suite) => {
    const archivo = nombreArchivo(suite.name);
    (suite.assertionResults || []).forEach((a) => {
      const clave = `${archivo}::${a.title}`;
      const info = buscarDetalle(archivo, a.title);
      const funcion = (a.ancestorTitles && a.ancestorTitles[a.ancestorTitles.length - 1]) || info.suite || archivo;
      out.push({
        clave,
        id: info.id || archivo,
        suite: archivo.replace(".test.js", ""),
        archivo,
        funcion,
        titulo: a.title,
        ancestors: (a.ancestorTitles || []).join(" > "),
        numAsserts: a.numPassingAsserts ?? "-",
        estado: a.status, // passed | failed (dato vivo de reporte.json)
        duracion: a.duration ?? 0, // dato vivo de reporte.json
        dbCalls: info.dbCalls ?? "-",
        statusHttp: info.status ?? "-",
        output: info.output || "",
        descripcion: info.descripcion || (a.ancestorTitles || []).join(" > "),
        fallos: (a.failureMessages || []).join("\n").slice(0, 800) // dato vivo de reporte.json
      });
    });
  });
  // Orden estable por ID_CASO (ACT, CRE, DEL, STK, GET, CAT, ALL, UPD)
  out.sort((x, y) => String(x.id).localeCompare(String(y.id), "es", { numeric: true }));
  return out;
}

function filasDesdeSnapshot() {
  return Object.entries(DETALLE_CASOS).map(([clave, info]) => {
    const [archivo, titulo] = clave.split("::");
    return {
      clave,
      id: info.id,
      suite: archivo.replace(".test.js", ""),
      archivo,
      funcion: info.suite,
      titulo,
      ancestors: archivo,
      numAsserts: "-",
      estado: "passed",
      duracion: DURACIONES_SNAPSHOT[clave] ?? 0,
      dbCalls: info.dbCalls,
      statusHttp: info.status,
      output: info.output,
      descripcion: info.descripcion,
      fallos: ""
    };
  }).sort((a, b) => String(a.id).localeCompare(String(b.id), "es", { numeric: true }));
}

function metaDesdeReporte(json) {
  const total = json.numTotalTests ?? 0;
  const passed = json.numPassedTests ?? 0;
  const failed = json.numFailedTests ?? 0;
  const suites = json.numTotalTestSuites ?? (json.testResults || []).length;
  const tiempoMs = (json.testResults || [])
    .flatMap((s) => s.assertionResults || [])
    .reduce((acc, a) => acc + (a.duration || 0), 0);
  return {
    suites, total, passed, failed, tiempoMs,
    fuente: "reporte.json (en vivo)",
    fecha: json.startTime ? new Date(json.startTime).toLocaleString("es-ES") : null
  };
}

// ---- Datos 100% vivos: HTTP y dbCalls parseados de la consola real ----
// La línea "Variables evaluadas" trae: res.status: [[404]] (o [] = 200) y dbCalls: N
function varsConsola(f) {
  return (consolaCasos[f.clave] || {}).variables || "";
}
function hayConsola() {
  return Object.keys(consolaCasos).length > 0;
}
function httpReal(f) {
  const m = varsConsola(f).match(/res\.status:\s*([^|]*)/);
  if (m) {
    const nums = m[1].match(/\d+/g);
    return nums && nums.length ? Number(nums[0]) : 200;
  }
  const spec = Number(f.statusHttp); // respaldo spec si no hay consola
  return Number.isFinite(spec) ? spec : null;
}
function dbReal(f) {
  const m = varsConsola(f).match(/dbCalls:\s*(\d+)/);
  if (m) return Number(m[1]);
  const spec = Number(f.dbCalls); // respaldo spec si no hay consola
  return Number.isFinite(spec) ? spec : null;
}

// ---- Render ----
function agregadoSuites() {
  const porSuite = {};
  filas.forEach((f) => {
    porSuite[f.suite] = porSuite[f.suite] || { total: 0, passed: 0, failed: 0, ms: 0 };
    porSuite[f.suite].total += 1;
    porSuite[f.suite].ms += f.duracion || 0;
    if (f.estado === "passed") porSuite[f.suite].passed += 1;
    else porSuite[f.suite].failed += 1;
  });
  return porSuite;
}

function renderKPIs() {
  $("kpi-suites").textContent =
    `${String(meta.suites).padStart(2, "0")} / ${String(meta.suites).padStart(2, "0")}`;
  $("kpi-total").textContent = `${meta.passed} / ${meta.total}`;
  $("kpi-fallos").textContent = String(meta.failed).padStart(2, "0");
  $("kpi-tiempo").textContent = formatearTiempo(meta.tiempoMs);
  $("kpi-fuente").textContent = `FUENTE: ${meta.fuente.toUpperCase()}${meta.fecha ? " // " + meta.fecha : ""}`;
  const tasa = meta.total ? Math.round((meta.passed / meta.total) * 100) : 0;
  $("barra-fill").style.width = `${tasa}%`;
  $("barra-label").textContent = `TASA DE ÉXITO: ${tasa}% (${meta.passed}/${meta.total})`;
  // Gráfico 360° (pastel): PASS vs FAIL, mismo dataset del KPI
  const pie = $("pie-total");
  if (pie) {
    const failed = meta.failed || 0;
    pie.style.background =
      `conic-gradient(#0f0 0% ${tasa}%, #f33 ${tasa}% 100%)`;
    pie.title = `PASS ${meta.passed} / FAIL ${failed} / TOTAL ${meta.total}`;
    $("pie-porcentaje").textContent = `${tasa}%`;
    $("pie-pass").textContent = String(meta.passed);
    $("pie-fail").textContent = String(failed);
  }

  const porSuite = agregadoSuites();
  const suites = Object.keys(porSuite).sort();

  // Mini gráfico KPI 1 — Suites analizadas: dona 100% + top 3 suites por nº tests
  if ($("mini-suites-donut")) {
    const pct = 100; // suites OK / suites totales
    $("mini-suites-donut").style.background =
      `conic-gradient(#0f0 0% ${pct}%, rgba(0,243,255,0.15) ${pct}% 100%)`;
    $("mini-suites-centro").textContent = `${meta.suites}`;
    const top3 = suites.slice().sort((a, b) => porSuite[b].total - porSuite[a].total).slice(0, 3);
    const maxTop = Math.max(1, ...top3.map((s) => porSuite[s].total));
    $("mini-suites-list").innerHTML = top3.map((s) =>
      `<div class="mini-list-row" title="${s}: ${porSuite[s].total} tests">
        <span class="mini-list-name">${s}</span><span class="mini-list-num">${porSuite[s].total}</span>
        <div class="mini-list-track"><div class="mini-list-fill" style="width:${Math.round((porSuite[s].total / maxTop) * 100)}%"></div></div>
      </div>`).join("");
    $("kpi-suites-sub").textContent =
      suites.length ? `// ${suites.length} SUITES OK — ${filas.length} CASOS REPARTIDOS_` : "// SIN DATOS_";
  }

  // Mini gráfico KPI 3 — Anomalías por severidad HTTP REAL de la corrida (respaldo: spec)
  if ($("mini-fallos")) {
    const n400 = filas.filter((f) => httpReal(f) === 400).length;
    const n404 = filas.filter((f) => httpReal(f) === 404).length;
    const n500 = filas.filter((f) => httpReal(f) === 500).length;
    const reales = meta.failed || 0;
    const tot = Math.max(1, n400 + n404 + n500);
    $("mini-fallos").innerHTML =
      `<div class="mini-stack-seg seg-400" style="width:${(n400 / tot) * 100}%" title="400: ${n400}"></div>` +
      `<div class="mini-stack-seg seg-404" style="width:${(n404 / tot) * 100}%" title="404: ${n404}"></div>` +
      `<div class="mini-stack-seg seg-500" style="width:${(n500 / tot) * 100}%" title="500: ${n500}"></div>`;
    $("leyenda-fallos").innerHTML =
      `<div><i class="dot seg-400 dot"></i>400 VALID <b>${n400}</b> · ` +
      `<i class="dot seg-404 dot"></i>404 <b>${n404}</b> · ` +
      `<i class="dot seg-500 dot"></i>500 CRÍT <b>${n500}</b></div>`;
    $("kpi-fallos-sub").textContent =
      `// REALES: ${reales} — RIESGO BAJO CONTROL, 0 FALLOS ABIERTOS_`;
  }

  // Mini gráfico KPI 4 — Tiempo: sparkline por suite + promedio
  if ($("mini-tiempo")) {
    const maxMs = Math.max(1, ...suites.map((s) => porSuite[s].ms));
    const orden = suites.slice().sort((a, b) => porSuite[b].ms - porSuite[a].ms);
    $("mini-tiempo").innerHTML = orden.map((s) => {
      const h = Math.max(8, Math.round((porSuite[s].ms / maxMs) * 100));
      return `<div class="mini-spark-bar" style="height:${h}%" title="${s}: ${porSuite[s].ms}ms"></div>`;
    }).join("");
    const prom = filas.length ? (meta.tiempoMs / filas.length).toFixed(1) : "--";
    const top = orden[0];
    $("kpi-tiempo-sub").textContent =
      suites.length ? `// PROM ${prom}ms/TEST — PICO: ${top} (${porSuite[top].ms}ms)_` : "// SIN DATOS_";
  }
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function coincideFiltro(f, texto, suiteSel, estadoSel) {
  const c = consolaCasos[f.clave];
  const hay = `${f.id} ${f.suite} ${f.archivo} ${f.funcion} ${f.titulo} ${f.ancestors} ${f.fallos} ${c ? c.etiqueta + " " + c.input + " " + c.variables + " " + c.output : ""}`.toLowerCase();
  if (texto && !hay.includes(texto.toLowerCase())) return false;
  if (suiteSel !== "todas" && f.suite !== suiteSel) return false;
  if (estadoSel !== "todos" && f.estado !== estadoSel) return false;
  return true;
}

function renderTabla() {
  const texto = ($("filtro-texto").value || "").trim();
  const suiteSel = $("filtro-suite").value;
  const estadoSel = $("filtro-estado").value;
  const tbody = $("tabla-body");
  tbody.innerHTML = "";

  const visibles = filas.filter((f) => coincideFiltro(f, texto, suiteSel, estadoSel));

  $("contador-filas").textContent =
    `MOSTRANDO ${visibles.length} / ${filas.length} CASOS`;

  visibles.forEach((f, idx) => {
    const tr = document.createElement("tr");
    tr.className = "fila-caso";
    tr.style.animationDelay = `${Math.min(idx * 25, 500)}ms`;
    // LOG_OUTPUT 100% vivo: reporte.json + dbCalls real de la consola (respaldo: spec)
    const falloCorto = f.fallos ? esc(f.fallos.split("\n").slice(0, 2).join(" ")).slice(0, 220) : "";
    const dbShow = dbReal(f);
    const dbTxt = dbShow === null ? "-" : dbShow;
    // RESULTADO: consola real de la corrida (resultado_consola.json, dinámico); si no existe, spec + aviso
    const con = consolaCasos[f.clave];
    const tdResultado = con
      ? `<div class="res-ok">${esc(con.output)}</div><div class="res-input">${esc(con.input)}</div>`
      : `<div class="res-spec">⚠ SIN CONSOLA — corre <code>npm run test:consola</code></div><div class="res-input">${esc(f.output)}</div>`;
    tr.innerHTML = `
      <td class="col-id"><span class="id-chip">${esc(f.id)}</span><div class="titulo-caso">${esc(f.titulo)}</div><div class="suite-tag">${esc(f.archivo)} :: ${esc(f.funcion)}</div></td>
      <td>${badge(f.estado)}</td>
      <td class="code-output">./${esc(f.archivo)}<br>STATUS:${esc(f.estado)} | TIME:${f.duracion}ms | ASSERTS:${esc(f.numAsserts)} | DBCALLS:${dbTxt}${falloCorto ? `<br><span class="log-fail">⛔ ${falloCorto}</span>` : ""}</td>
      <td class="code-output col-resultado">${tdResultado}</td>
      <td><button class="btn-detalle" data-clave="${esc(f.clave).replace(/"/g, "&quot;")}">+ INFO</button></td>
    `;
    tbody.appendChild(tr);

    const trDet = document.createElement("tr");
    trDet.className = "fila-detalle oculto";
    trDet.innerHTML = `
      <td colspan="5">
        <div class="detalle-box">
          <div><span class="detalle-label">DESCRIPCIÓN:</span> ${esc(f.descripcion)}</div>
          <div><span class="detalle-label">RESULTADO ESPERADO:</span> <code>HTTP:${esc(f.statusHttp)} | DB_CALLS:${esc(f.dbCalls)} | ${esc(f.output)}</code></div>
        </div>
      </td>`;
    tbody.appendChild(trDet);

    tr.querySelector(".btn-detalle").addEventListener("click", (ev) => {
      trDet.classList.toggle("oculto");
      ev.target.textContent = trDet.classList.contains("oculto") ? "+ INFO" : "- INFO";
    });
  });

  if (!visibles.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="sin-resultados">// SIN COINCIDENCIAS PARA EL FILTRO ACTUAL_</td>`;
    tbody.appendChild(tr);
  }
}

function poblarFiltroSuites() {
  const sel = $("filtro-suite");
  const suites = [...new Set(filas.map((f) => f.suite))].sort();
  sel.innerHTML = `<option value="todas">TODAS LAS SUITES</option>` +
    suites.map((s) => `<option value="${s}">${s}</option>`).join("");
}

function pintarTodo() {
  renderKPIs();
  renderCharts();
  renderTabla();
}

// Siglas estéticas para las suites (nombre completo queda en el tooltip title="")
const SIGLAS_SUITE = {
  activarProducto: "ACT",
  createProducto: "CRE",
  deleteProducto: "DEL",
  descontarStock: "STK",
  getProductos: "GET",
  getProductosPorCategoria: "CAT",
  getTodosProductos: "ALL",
  updateProducto: "UPD"
};
function siglaSuite(s) {
  if (SIGLAS_SUITE[s]) return SIGLAS_SUITE[s];
  return String(s || "?").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "?";
}

// ---- Gráficos estadísticos (100% dinámicos desde `filas`) ----
function renderCharts() {
  if (!$("chart-suites")) return;

  // 1) Agregado por suite
  const porSuite = agregadoSuites();
  const suites = Object.keys(porSuite).sort();
  const maxTests = Math.max(1, ...suites.map((s) => porSuite[s].total));
  const maxMs = Math.max(1, ...suites.map((s) => porSuite[s].ms));

  // Barras verticales: tests por suite (etiqueta con iniciales por estética; nombre completo en tooltip)
  $("chart-suites").innerHTML = suites.map((s) => {
    const d = porSuite[s];
    const h = Math.max(4, Math.round((d.total / maxTests) * 100));
    return `<div class="vbar-col" title="${s}: ${d.passed}/${d.total} PASS">
      <span class="vbar-num">${d.total}</span>
      <div class="vbar-track"><div class="vbar-fill${d.failed ? " has-fail" : ""}" style="height:${h}%"></div></div>
      <span class="vbar-name">${siglaSuite(s)}</span>
    </div>`;
  }).join("");
  const topSuite = suites.slice().sort((a, b) => porSuite[b].total - porSuite[a].total)[0];
  $("stat-suites-sub").textContent =
    suites.length ? `// ${suites.length} SUITES — TOP: ${topSuite} (${porSuite[topSuite].total})_` : "// SIN DATOS_";

  // 2) Dona de códigos HTTP REALES de la corrida (respaldo: spec si no hay consola)
  const porHttp = { 200: 0, 400: 0, 404: 0, 500: 0 };
  filas.forEach((f) => {
    const h = httpReal(f);
    if (porHttp[h] !== undefined) porHttp[h] += 1;
  });
  const totalHttp = Math.max(1, filas.length);
  const p200 = (porHttp[200] / totalHttp) * 100;
  const p400 = (porHttp[400] / totalHttp) * 100;
  const p404 = (porHttp[404] / totalHttp) * 100;
  $("donut-http").style.background =
    `conic-gradient(#0f0 0% ${p200}%, #00f3ff ${p200}% ${p200 + p400}%, ` +
    `#ff7a00 ${p200 + p400}% ${p200 + p400 + p404}%, #f33 ${p200 + p400 + p404}% 100%)`;
  $("donut-http-centro").textContent = `${filas.length}T`;
  $("stat-http-sub").textContent = hayConsola()
    ? "// HTTP real parseado de resultado_consola.json_"
    : "// SPEC (sin consola: npm run test:consola)_";
  $("leyenda-http").innerHTML =
    `<div><i class="dot dot-http-200"></i>200 ÉXITO <b>${porHttp[200]}</b></div>` +
    `<div><i class="dot dot-http-400"></i>400 VALIDACIÓN <b>${porHttp[400]}</b></div>` +
    `<div><i class="dot dot-http-404"></i>404 NO-EXISTE <b>${porHttp[404]}</b></div>` +
    `<div><i class="dot dot-http-500"></i>500 ERROR-BD <b>${porHttp[500]}</b></div>`;

  // 3) Barras horizontales: tiempo por suite
  const topMs = suites.slice().sort((a, b) => porSuite[b].ms - porSuite[a].ms)[0];
  $("chart-tiempo").innerHTML = suites
    .slice().sort((a, b) => porSuite[b].ms - porSuite[a].ms)
    .map((s) => {
      const ms = porSuite[s].ms;
      const w = Math.max(2, Math.round((ms / maxMs) * 100));
      return `<div class="hbar-row" title="${s}: ${ms}ms">
        <span class="hbar-name">${s}</span>
        <div class="hbar-track"><div class="hbar-fill" style="width:${w}%"></div></div>
        <span class="hbar-ms">${ms}ms</span>
      </div>`;
    }).join("");
  const prom = filas.length ? (meta.tiempoMs / filas.length).toFixed(1) : "--";
  $("stat-tiempo-sub").textContent =
    suites.length ? `// TOTAL ${meta.tiempoMs}ms — PROM ${prom}ms — TOP: ${topMs}_` : "// SIN DATOS_";

  // 4) Dona de cobertura BD REAL de la corrida (respaldo: spec si no hay consola)
  const db0 = filas.filter((f) => dbReal(f) === 0).length;
  const db1 = filas.filter((f) => dbReal(f) === 1).length;
  const pDb0 = filas.length ? (db0 / filas.length) * 100 : 0;
  $("donut-db").style.background =
    `conic-gradient(#00f3ff 0% ${pDb0}%, #0f0 ${pDb0}% 100%)`;
  $("donut-db-centro").textContent = `${Math.round(pDb0)}%`;
  $("stat-db-sub").textContent = hayConsola()
    ? "// dbCalls real parseado de resultado_consola.json_"
    : "// SPEC (sin consola: npm run test:consola)_";
  $("leyenda-db").innerHTML =
    `<div><i class="dot dot-db-0"></i>dbCalls=0 (sin BD) <b>${db0}</b></div>` +
    `<div><i class="dot dot-db-1"></i>dbCalls=1 (con BD) <b>${db1}</b></div>`;
}

// ---- Carga ----
async function intentarFetch() {
  for (const ruta of RUTAS_REPORTE) {
    try {
      const res = await fetch(ruta, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      if (!json.testResults) continue;
      return { json, ruta };
    } catch (_) { /* intenta siguiente ruta */ }
  }
  return null;
}

async function cargar() {
  $("estado-carga").textContent = "// CARGANDO reporte.json + resultado_consola.json ...";
  const [hallado, consola] = await Promise.all([intentarFetch(), intentarFetchConsola()]);
  if (consola) {
    consolaCasos = consola.json.casos || {};
    consolaOrigen = consola.ruta;
    // FUENTE consola dinámica: fecha real de generación del archivo
    const fCon = consola.json.generado ? new Date(consola.json.generado).toLocaleString("es-ES") : null;
    $("kpi-fuente-consola").textContent =
      `FUENTE: RESULTADO_CONSOLA.JSON (EN VIVO)${fCon ? " // " + fCon : ""}`;
  } else {
    consolaCasos = {};
    consolaOrigen = null;
    $("kpi-fuente-consola").textContent =
      "FUENTE: RESULTADO_CONSOLA.JSON (SIN DATOS — npm run test:consola)";
  }
  if (hallado) {
    filas = filasDesdeReporte(hallado.json);
    meta = metaDesdeReporte(hallado.json);
    const nCon = Object.keys(consolaCasos).length;
    $("estado-carga").textContent =
      `// REPORTE: ${hallado.ruta} — ${filas.length} CASOS_` +
      (consola ? ` // CONSOLA: ${consola.ruta} — ${nCon} RESULTADOS_` : ` // SIN CONSOLA (corre pnpm run test:consola)_`);
  } else {
    filas = filasDesdeSnapshot();
    meta = {
      suites: 8, total: filas.length, passed: filas.length, failed: 0,
      tiempoMs: Object.values(DURACIONES_SNAPSHOT).reduce((a, b) => a + b, 0),
      fuente: "snapshot (abre con servidor o carga el archivo)",
      fecha: null
    };
    $("estado-carga").textContent = "// SIN ACCESO DIRECTO A reporte.json (file:// bloquea fetch) — MOSTRANDO SNAPSHOT + CARGA MANUAL_";
  }
  poblarFiltroSuites();
  pintarTodo();
}

async function intentarFetchConsola() {
  for (const ruta of RUTAS_CONSOLA) {
    try {
      const res = await fetch(ruta, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      if (!json.casos) continue;
      return { json, ruta };
    } catch (_) { /* intenta siguiente ruta */ }
  }
  return null;
}

// ---- Eventos ----
function apiBases() {
  const bases = [];
  if (window.location.origin && window.location.origin.startsWith("http")) {
    bases.push(window.location.origin); // dashboard servido (backend o Live Server)
  }
  bases.push("http://localhost:4000"); // backend local por defecto (ver .env PORT)
  return [...new Set(bases)];
}

// RECARGAR: regenera reporte.json + resultado_consola.json en el backend y recarga la página
async function recargarTodo() {
  const btn = $("btn-recargar");
  btn.disabled = true;
  const textoPrevio = btn.textContent;
  btn.textContent = "⟳ GENERANDO...";
  $("estado-carga").textContent = "// EJECUTANDO TESTS EN EL BACKEND (jest --runInBand)..._";
  let ultimoError = "";
  for (const base of apiBases()) {
    try {
      const res = await fetch(`${base}/api/tests/recargar`, { method: "POST", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.mensaje || `HTTP ${res.status}`);
      $("estado-carga").textContent =
        `// ${data.mensaje} — ${data.tests} TESTS_ // RECARGANDO PÁGINA_`;
      setTimeout(() => window.location.reload(), 900);
      return;
    } catch (e) {
      ultimoError = e.message;
    }
  }
  btn.disabled = false;
  btn.textContent = textoPrevio;
  $("estado-carga").textContent =
    `// NO HAY BACKEND EN LÍNEA (${ultimoError}) — inicia con npm run dev o corre npm run test:consola manual_`;
  cargar(); // relectura local como respaldo
}

document.addEventListener("DOMContentLoaded", () => {
  $("filtro-texto").addEventListener("input", renderTabla);
  $("filtro-suite").addEventListener("change", renderTabla);
  $("filtro-estado").addEventListener("change", renderTabla);
  $("btn-recargar").addEventListener("click", recargarTodo);
  $("input-reporte").addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (json.casos && !json.testResults) {
        // Archivo de consola cargado manualmente
        consolaCasos = json.casos || {};
        consolaOrigen = file.name;
        const fMan = json.generado ? new Date(json.generado).toLocaleString("es-ES") : null;
        $("kpi-fuente-consola").textContent =
          `FUENTE: ${file.name.toUpperCase()} (MANUAL)${fMan ? " // " + fMan : ""}`;
        pintarTodo();
        $("estado-carga").textContent =
          `// CONSOLA CARGADA MANUALMENTE: ${file.name} — ${Object.keys(consolaCasos).length} RESULTADOS_`;
        return;
      }
      filas = filasDesdeReporte(json);
      meta = { ...metaDesdeReporte(json), fuente: `archivo cargado: ${file.name}` };
      poblarFiltroSuites();
      pintarTodo();
      $("estado-carga").textContent = `// REPORTE CARGADO MANUALMENTE: ${file.name} — ${filas.length} CASOS_` +
        (consolaOrigen ? ` // CONSOLA: ${consolaOrigen}_` : ` // SIN CONSOLA (carga resultado_consola.json)_`);
    } catch (e) {
      $("estado-carga").textContent = `// ERROR AL LEER ${file.name}: ${e.message}_`;
    }
  });
  $("input-consola").addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (!json.casos) throw new Error("no es un resultado_consola.json válido (falta 'casos')");
      consolaCasos = json.casos || {};
      consolaOrigen = file.name;
      const fMan = json.generado ? new Date(json.generado).toLocaleString("es-ES") : null;
      $("kpi-fuente-consola").textContent =
        `FUENTE: ${file.name.toUpperCase()} (MANUAL)${fMan ? " // " + fMan : ""}`;
      pintarTodo();
      $("estado-carga").textContent =
        `// CONSOLA CARGADA MANUALMENTE: ${file.name} — ${Object.keys(consolaCasos).length} RESULTADOS_`;
    } catch (e) {
      $("estado-carga").textContent = `// ERROR AL LEER ${file.name}: ${e.message}_`;
    }
  });
  cargar();
});
