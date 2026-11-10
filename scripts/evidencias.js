// Convierte resultados.json en un solo archivo, evidencias.html, con pantallazos incluidos.
// Se abre con doble clic. Si corre en GitHub Actions, también escribe el resumen de la corrida.
const fs = require('fs');

if (!fs.existsSync('resultados.json')) {
  console.log('Todavía no hay resultados. Primero corre las pruebas: npm test (o npm run verificar-clase)');
  process.exit(1);
}
const reporte = JSON.parse(fs.readFileSync('resultados.json', 'utf8'));
const casos = [];

function recorrer(suite, archivo) {
  const nombre = suite.file || archivo;
  for (const spec of suite.specs || []) {
    for (const prueba of spec.tests) {
      const resultado = prueba.results[prueba.results.length - 1] || {};
      const anotaciones = [...(prueba.annotations || []), ...(resultado.annotations || [])];
      const hallazgo = anotaciones.find((a) => a.type === 'hallazgo');
      const mensaje = (resultado.error?.message || '').replace(/\u001b\[[0-9;]*m/g, '');
      casos.push({
        archivo: nombre,
        titulo: spec.title,
        ok: prueba.status === 'expected' && !mensaje.includes('PENDIENTE'),
        // Hallazgo esperado: la prueba falló por un bug sembrado del Banco Demo, como se esperaba.
        hallazgo: hallazgo && prueba.status === 'expected' && !mensaje.includes('PENDIENTE') ? hallazgo.description : '',
        pendiente: mensaje.includes('PENDIENTE'),
        segundos: ((resultado.duration || 0) / 1000).toFixed(1),
        error: (resultado.error?.message || '').replace(/\u001b\[[0-9;]*m/g, '').slice(0, 700),
        imagenes: (resultado.attachments || []).filter((a) => a.contentType === 'image/png' && a.path && fs.existsSync(a.path)),
      });
    }
  }
  for (const hija of suite.suites || []) recorrer(hija, nombre);
}
reporte.suites.forEach((suite) => recorrer(suite));

const texto = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const enRojo = casos.filter((c) => !c.ok && !c.pendiente).length;
const pendientes = casos.filter((c) => c.pendiente).length;
const hallazgos = casos.filter((c) => c.hallazgo).length;
const peso = (c) => (c.ok ? (c.hallazgo ? 2 : 3) : c.pendiente ? 1 : 0);
const orden = [...casos].sort((a, b) => peso(a) - peso(b));
const icono = (c) => (c.pendiente ? '⏳' : c.hallazgo ? '🐞' : c.ok ? '✅' : '❌');
const clase = (c) => (c.pendiente ? 'pendiente' : c.hallazgo ? 'hallazgo' : c.ok ? 'bien' : 'mal');

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Evidencias de las pruebas</title><style>
body{font-family:system-ui,sans-serif;max-width:1000px;margin:24px auto;padding:0 16px;color:#1d2130}
.resumen{font-size:22px;font-weight:700}details{border:1px solid #ccd;border-radius:8px;margin:8px 0;padding:10px 14px}
summary{cursor:pointer;font-weight:600}.mal{border-left:6px solid #e03131}.bien{border-left:6px solid #2f9e44}.pendiente{border-left:6px solid #f59f00}.hallazgo{border-left:6px solid #7048e8}.nota{color:#5f3dc4;font-weight:600}
pre{background:#f4f4f7;padding:10px;white-space:pre-wrap}img{max-width:100%;border:1px solid #ccd;margin-top:8px}figcaption{color:#667;font-size:14px}
</style></head><body><h1>Evidencias de las pruebas</h1>
<p class="resumen">${casos.length - enRojo - pendientes - hallazgos} en verde · ${hallazgos} hallazgos esperados · ${pendientes} retos pendientes · ${enRojo} en rojo</p>
<p>❌ en rojo: revisa si el resultado esperado está bien escrito o si encontraste algo nuevo. ⏳ pendiente: un reto sin resolver. 🐞 hallazgo esperado: la prueba encontró un bug sembrado del Banco Demo.</p>
${orden.map((c) => `<details class="${clase(c)}"${c.ok || c.pendiente ? '' : ' open'}><summary>${icono(c)} ${texto(c.titulo)} <small>(${c.segundos} s · ${texto(c.archivo)})</small></summary>
${c.hallazgo ? `<p class="nota">Hallazgo esperado · ${texto(c.hallazgo)}</p>` : ''}
${c.error ? `<pre>${texto(c.error)}</pre>` : ''}
${c.imagenes.map((i) => `<figure><img loading="lazy" alt="${texto(i.name)}" src="data:image/png;base64,${fs.readFileSync(i.path).toString('base64')}"><figcaption>${texto(i.name)}</figcaption></figure>`).join('')}
</details>`).join('\n')}
</body></html>`;
fs.writeFileSync('evidencias.html', html);
console.log(`evidencias.html: ${casos.length - enRojo - pendientes - hallazgos} en verde, ${hallazgos} hallazgos, ${pendientes} pendientes, ${enRojo} en rojo`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const celda = (t) => String(t).replace(/\|/g, '/');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## ${enRojo ? '🔴' : '🟢'} ${casos.length - enRojo - pendientes - hallazgos} en verde · ${hallazgos} hallazgos · ${pendientes} pendientes · ${enRojo} en rojo\n\n` +
    `Las evidencias con pantallazos están abajo, en **Artifacts**: abre \`evidencias.html\`.\n\n| | Caso | Segundos |\n|---|---|---|\n` +
    orden.map((c) => `| ${icono(c)} | ${celda(c.titulo)} | ${c.segundos} |`).join('\n') + '\n');
}
