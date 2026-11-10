// Revisa todo el repo con UN comando: corre las pruebas y muestra una tabla con
// las pruebas base, los retos (pendientes o resueltos) y los hallazgos esperados.
//
// Uso:
//   npm run verificar-clase                      detecta el estado por los PENDIENTE
//   npm run verificar-clase -- s03-inicio        exige exactamente el estado de esa etiqueta
//   npm run verificar-clase -- --proyectos=ui,unidad   corre solo esos proyectos
//
// Termina con código 0 si el estado es el esperado y con 1 si hay algo que revisar.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const RESULTADOS = path.join(RAIZ, 'resultados.json');

const RETOS = {
  S3: {
    1: 'PaginaLogin.ingresar',
    2: 'PaginaOtp.validar',
    3: 'PaginaTransferir.transferir',
    4: 'ClienteBanco.transferir',
    5: 'iniciarSesionPorUi',
  },
  S4: {
    1: 'SRP · separar AyudanteTodo',
    2: 'OCP · reglas de costo y cuenta Nómina',
    3: 'LSP · corregir la jerarquía de páginas',
    4: 'ISP · interfaces pequeñas',
    5: 'DIP · Cliente y ClienteFalso',
  },
};

// Bugs sembrados a propósito en el Banco Demo. Las pruebas los esperan: no se corrigen.
const HALLAZGOS = {
  'BUG-01': { texto: 'el monto exacto de $1.000 se rechaza', necesita: 'reto 3 de la S3' },
  'BUG-02': { texto: 'desde Corriente no se descuenta el 4x1000 del saldo', necesita: 'reto 4 de la S3' },
  'BUG-03': { texto: '"BLOQUEADO" en mayúsculas puede entrar', necesita: null },
  'MIG-01': { texto: 'en /api/v2/cuentas la cuenta Corriente dice "Ahorros"', necesita: null },
};
const TODOS = Object.keys(HALLAZGOS);

// Lo que debe pasar en cada etiqueta del repo.
const ESTADOS = {
  's03-inicio': { pendientes: { S3: [1, 2, 3, 4, 5], S4: [] }, retosS04: false, confirmados: ['BUG-03', 'MIG-01'] },
  's03-solucion': { pendientes: { S3: [], S4: [] }, retosS04: false, confirmados: TODOS },
  's04-inicio': { pendientes: { S3: [], S4: [1, 2, 3, 4, 5] }, retosS04: true, confirmados: TODOS },
  's04-solucion': { pendientes: { S3: [], S4: [] }, retosS04: true, confirmados: TODOS },
};

// ---------- Argumentos ----------
const argumentos = process.argv.slice(2);
const pedido = argumentos.find((a) => !a.startsWith('--'));
const proyectos = (argumentos.find((a) => a.startsWith('--proyectos=')) || '').replace('--proyectos=', '').split(',').filter(Boolean);
const verSalida = argumentos.includes('--ver');
if (pedido && !ESTADOS[pedido]) {
  console.log(`Estado desconocido: ${pedido}. Usa uno de: ${Object.keys(ESTADOS).join(', ')}`);
  process.exit(1);
}

// ---------- Colores (solo en una terminal) ----------
const conColor = process.stdout.isTTY && !process.env.NO_COLOR;
const pintar = (codigo) => (t) => (conColor ? `\u001b[${codigo}m${t}\u001b[0m` : String(t));
const verde = pintar('32');
const rojo = pintar('31');
const amarillo = pintar('33');
const azul = pintar('36');
const negrita = pintar('1');
// Una etiqueta de estado de ancho fijo, para que la tabla quede alineada.
const etiqueta = (texto, color) => color(texto.padEnd(13));

// ---------- 1. Correr las pruebas ----------
console.log(negrita('Verificación de clase'));
console.log(`Corriendo las pruebas${proyectos.length ? ` de: ${proyectos.join(', ')}` : ''}. Tarda menos de un minuto...`);
fs.rmSync(RESULTADOS, { force: true });
const cli = require.resolve('@playwright/test/cli', { paths: [RAIZ] });
const corrida = spawnSync(process.execPath, [cli, 'test', ...proyectos.map((p) => `--project=${p}`)], {
  cwd: RAIZ,
  encoding: 'utf8',
  env: { ...process.env, PLAYWRIGHT_HTML_OPEN: 'never', FORCE_COLOR: '0' },
  maxBuffer: 64 * 1024 * 1024,
});
if (verSalida) console.log(corrida.stdout, corrida.stderr);
if (!fs.existsSync(RESULTADOS)) {
  console.log(rojo('No se generó resultados.json. Esto dijo Playwright:'));
  console.log(corrida.stdout, corrida.stderr);
  process.exit(1);
}

// ---------- 2. Clasificar cada prueba ----------
const sinColores = (t) => String(t || '').replace(/\u001b\[[0-9;]*m/g, '');
const reporte = JSON.parse(fs.readFileSync(RESULTADOS, 'utf8'));
const pruebas = [];

function recorrer(suite, archivo) {
  const nombre = suite.file || archivo;
  for (const spec of suite.specs || []) {
    for (const prueba of spec.tests) {
      const resultado = prueba.results[prueba.results.length - 1] || {};
      const error = sinColores([resultado.error?.message, ...(resultado.errors || []).map((e) => e.message)].join('\n'));
      const anotaciones = [...(prueba.annotations || []), ...(resultado.annotations || [])];
      const hallazgo = anotaciones.find((a) => a.type === 'hallazgo');
      const pendiente = error.match(/PENDIENTE \((S\d)\)[^\n]*?reto (\d)/);
      const carpeta = nombre.split('/')[1] || '';
      const retoDelArchivo = path.basename(nombre).match(/^reto(\d)/);

      let tipo;
      if (prueba.status === 'skipped') tipo = 'omitida';
      else if (pendiente) tipo = 'pendiente';
      else if (hallazgo) tipo = prueba.status === 'expected' ? 'hallazgo' : 'alerta';
      else tipo = prueba.status === 'expected' || prueba.status === 'flaky' ? 'verde' : 'rojo';

      pruebas.push({
        archivo: nombre.replace(/^tests\//, '').replace(/\.spec\.ts$/, ''),
        carpeta,
        titulo: spec.title,
        tipo,
        error: error.split('\n').find((l) => l.trim()) || '',
        hallazgo: hallazgo ? hallazgo.description.split(':')[0] : null,
        sesion: carpeta === 'retos-s03' ? 'S3' : carpeta === 'retos-s04' ? 'S4' : null,
        reto: retoDelArchivo ? Number(retoDelArchivo[1]) : null,
        pendienteDe: pendiente ? { sesion: pendiente[1], reto: Number(pendiente[2]) } : null,
      });
    }
  }
  for (const hija of suite.suites || []) recorrer(hija, nombre);
}
reporte.suites.forEach((suite) => recorrer(suite));

const problemas = [];
for (const e of reporte.errors || []) problemas.push(`Error al cargar las pruebas: ${sinColores(e.message).split('\n')[0]}`);
if (!pruebas.length) problemas.push('No se ejecutó ninguna prueba.');

// ---------- 3. Pruebas base: todo lo que no es reto ni hallazgo ----------
const linea = () => console.log('-'.repeat(78));
const columna = (t, n) => String(t).padEnd(n);
console.log('');
console.log(negrita('PRUEBAS BASE') + ' (deben estar en verde)');
linea();
const base = pruebas.filter((p) => !p.sesion && p.tipo !== 'hallazgo' && p.tipo !== 'alerta');
const porArchivo = new Map();
for (const p of base) porArchivo.set(p.archivo, [...(porArchivo.get(p.archivo) || []), p]);
for (const [archivo, lista] of porArchivo) {
  const bien = lista.filter((p) => p.tipo === 'verde').length;
  const estado = bien === lista.length ? etiqueta('OK', verde) : etiqueta('FALLA', rojo);
  console.log(`${estado}${columna(archivo, 40)}${bien}/${lista.length} en verde`);
  for (const p of lista.filter((x) => x.tipo !== 'verde')) {
    console.log(rojo(`        - ${p.titulo}: ${p.error.slice(0, 120)}`));
    problemas.push(`Prueba base en rojo: ${p.archivo} › ${p.titulo}`);
  }
}

// ---------- 4. Retos ----------
const pendientesPorSesion = { S3: new Set(), S4: new Set() };
for (const p of pruebas) if (p.pendienteDe) pendientesPorSesion[p.pendienteDe.sesion].add(p.pendienteDe.reto);
const hayRetosS04 = fs.existsSync(path.join(RAIZ, 'tests', 'retos-s04'));
const corrioSesion = (sesion) => pruebas.some((p) => p.sesion === sesion);
const resueltosPorSesion = { S3: 0, S4: 0 };

for (const sesion of ['S3', 'S4']) {
  console.log('');
  console.log(negrita(`RETOS ${sesion}`));
  linea();
  if (sesion === 'S4' && !hayRetosS04) {
    console.log(azul('Todavía no se han publicado (llegan con la etiqueta s04-inicio).'));
    continue;
  }
  if (!corrioSesion(sesion)) {
    console.log(azul('No se corrieron en esta verificación.'));
    continue;
  }
  for (const [numero, nombre] of Object.entries(RETOS[sesion])) {
    const lista = pruebas.filter((p) => p.sesion === sesion && p.reto === Number(numero));
    if (!lista.length) continue;
    const enRojo = lista.filter((p) => p.tipo === 'rojo' || p.tipo === 'alerta');
    let estado;
    if (enRojo.length) estado = etiqueta('CON ERRORES', rojo);
    else if (pendientesPorSesion[sesion].has(Number(numero))) estado = etiqueta('PENDIENTE', amarillo);
    else {
      estado = etiqueta('RESUELTO', verde);
      resueltosPorSesion[sesion] += 1;
    }
    console.log(`${estado}Reto ${numero} · ${columna(nombre, 42)}${lista.length} pruebas`);
    for (const p of enRojo) {
      console.log(rojo(`            - ${p.titulo}: ${p.error.slice(0, 120)}`));
      problemas.push(`Reto ${numero} de la ${sesion} con una prueba en rojo: ${p.titulo}`);
    }
  }
}

// ---------- 5. Hallazgos esperados ----------
console.log('');
console.log(negrita('HALLAZGOS ESPERADOS') + ' (bugs sembrados en el Banco Demo: no se corrigen)');
linea();
const corridaCompleta = proyectos.length === 0;
const confirmados = new Set();
for (const [id, { texto, necesita }] of Object.entries(HALLAZGOS)) {
  const lista = pruebas.filter((p) => p.hallazgo === id);
  const confirmada = lista.find((p) => p.tipo === 'hallazgo');
  const alerta = lista.find((p) => p.tipo === 'alerta');
  const pendiente = lista.find((p) => p.tipo === 'pendiente');
  let estado;
  if (alerta) {
    estado = etiqueta('YA NO FALLA', rojo);
    problemas.push(`${id}: la prueba pasó. ¿Corrigieron el bug del Banco Demo? Los bugs sembrados no se corrigen.`);
  } else if (confirmada) {
    estado = etiqueta('CONFIRMADO', verde);
    confirmados.add(id);
  } else if (pendiente) {
    estado = etiqueta('ESPERA', amarillo);
  } else if (!corridaCompleta) {
    estado = etiqueta('NO SE CORRIÓ', azul);
  } else {
    estado = etiqueta('NO APARECE', rojo);
    problemas.push(`${id}: no hay ninguna prueba que lo detecte.`);
  }
  const donde = confirmada ? ` (${confirmada.archivo})` : pendiente && necesita ? ` (aparece al resolver el ${necesita})` : '';
  console.log(`${estado}${id}  ${texto}${donde}`);
}

// ---------- 6. Estado del repo ----------
let detectado;
if (hayRetosS04) detectado = pendientesPorSesion.S4.size ? 's04-inicio' : 's04-solucion';
else detectado = pendientesPorSesion.S3.size ? 's03-inicio' : 's03-solucion';
const esperado = pedido || detectado;

if (pedido && corridaCompleta) {
  const regla = ESTADOS[pedido];
  const lista = (s) => [...s].sort().join(', ') || 'ninguno';
  if (regla.retosS04 !== hayRetosS04) {
    problemas.push(regla.retosS04 ? 'Faltan los retos de la S4 (tests/retos-s04).' : 'Los retos de la S4 no deberían estar todavía.');
  }
  for (const sesion of ['S3', 'S4']) {
    const tiene = lista(pendientesPorSesion[sesion]);
    const debe = lista(regla.pendientes[sesion]);
    if (tiene !== debe) problemas.push(`Retos pendientes de la ${sesion}: hay [${tiene}] y en ${pedido} deben ser [${debe}].`);
  }
  const tiene = lista(confirmados);
  const debe = lista(regla.confirmados);
  if (tiene !== debe) problemas.push(`Hallazgos confirmados: hay [${tiene}] y en ${pedido} deben ser [${debe}].`);
}

// ---------- 7. Resumen ----------
const cuenta = (tipo) => pruebas.filter((p) => p.tipo === tipo).length;
const resueltos = (sesion) => resueltosPorSesion[sesion];
console.log('');
console.log(negrita('RESUMEN'));
linea();
if (corridaCompleta) {
  console.log(`Estado ${pedido ? 'pedido' : 'detectado'}: ${negrita(esperado)}${pedido && pedido !== detectado ? ` (el código parece ${detectado})` : ''}`);
} else {
  console.log(`Corrida parcial (${proyectos.join(', ')}): solo se revisa que no haya pruebas en rojo.`);
}
console.log(`Pruebas: ${pruebas.length} en total · ${cuenta('verde')} en verde · ${cuenta('pendiente')} pendientes · ${cuenta('hallazgo')} hallazgos · ${cuenta('rojo') + cuenta('alerta')} en rojo`);
if (corrioSesion('S3')) console.log(`Retos S3: ${resueltos('S3')} de 5 resueltos`);
if (hayRetosS04 && corrioSesion('S4')) console.log(`Retos S4: ${resueltos('S4')} de 5 resueltos`);
console.log(`Hallazgos confirmados: ${confirmados.size} de ${TODOS.length}`);
console.log('Detalle con pantallazos: npm run evidencias  ·  Reporte completo: npm run reporte');
console.log('');

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Verificación de clase: ${corridaCompleta ? esperado : 'corrida parcial'} ${problemas.length ? '🔴' : '🟢'}\n\n` +
    `| Base en verde | Pendientes | Hallazgos | En rojo |\n|---|---|---|---|\n` +
    `| ${cuenta('verde')} | ${cuenta('pendiente')} | ${cuenta('hallazgo')} | ${cuenta('rojo') + cuenta('alerta')} |\n\n` +
    (problemas.length ? problemas.map((p) => `- ${p}`).join('\n') + '\n\n' : ''));
}

if (problemas.length) {
  console.log(rojo(negrita(`HAY ${problemas.length} COSA(S) QUE REVISAR:`)));
  for (const p of problemas) console.log(rojo(`  - ${p}`));
  process.exit(1);
}
console.log(verde(negrita(corridaCompleta ? `TODO EN ORDEN: el repo está como se espera para ${esperado}.` : 'TODO EN ORDEN: ninguna prueba en rojo.')));
