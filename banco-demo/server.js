// Banco Demo: sistema de práctica para el bootcamp. Corre solo en tu computador y no usa internet.
// Tiene defectos a propósito, para practicar la caza de bugs. No los corrijas: las pruebas los esperan.
// Se inicia solo al correr las pruebas. Para explorarlo a mano: npm run demo
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { calcularGmf, validarTransferencia } = require('./reglas');

const PUERTO = Number(process.env.PUERTO_DEMO || 4000);
const PUBLICO = path.join(__dirname, 'public');
const PAGINAS = {
  '/': 'login.html', '/otp': 'otp.html', '/inicio': 'inicio.html',
  '/transferir': 'transferir.html', '/buzon': 'buzon.html',
  '/estilos.css': 'estilos.css', '/comun.js': 'comun.js',
};
const USUARIOS = {
  ana: { clave: 'Clave123', nombre: 'Ana Pérez' },
  luis: { clave: 'Clave123', nombre: 'Luis Gómez' },
  bloqueado: { clave: 'Clave123', nombre: 'Usuario Bloqueado', bloqueado: true },
};

// Tabla de equivalencias de la migración a la versión 2 del servicio de cuentas.
const PRODUCTOS_V2 = { Ahorros: 'Ahorros', Corriente: 'Ahorros' };

// Todo vive en memoria: cada inicio de sesión arranca con sus propios saldos.
const desafios = new Map();
const sesiones = new Map();
const buzon = new Map();

function responder(res, estado, cuerpo) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo));
}

function leerJson(req) {
  return new Promise((resolve) => {
    let datos = '';
    req.on('data', (parte) => { datos += parte; });
    req.on('end', () => { try { resolve(JSON.parse(datos || '{}')); } catch { resolve(null); } });
  });
}

function sesionDe(req) {
  return sesiones.get((req.headers.authorization || '').replace('Bearer ', ''));
}

async function api(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/salud') return responder(res, 200, { estado: 'ok' });

  if (req.method === 'POST' && url.pathname === '/api/login') {
    const { usuario, clave } = (await leerJson(req)) || {};
    if (!usuario || !clave) return responder(res, 400, { error: 'Usuario y clave son obligatorios' });
    const datos = USUARIOS[String(usuario).toLowerCase()];
    if (!datos || datos.clave !== clave) return responder(res, 401, { error: 'Usuario o clave incorrectos' });
    if (datos.bloqueado && usuario === 'bloqueado') return responder(res, 423, { error: 'Tu usuario está bloqueado. Comunícate con la línea de atención' });
    const idDesafio = crypto.randomUUID();
    const codigo = String(crypto.randomInt(100000, 1000000));
    const clave_ = String(usuario).toLowerCase();
    desafios.set(idDesafio, { usuario: clave_, codigo });
    buzon.set(clave_, [{ codigo, mensaje: `Banco Demo: tu código de seguridad es ${codigo}`, fecha: new Date().toISOString() }, ...(buzon.get(clave_) || [])].slice(0, 5));
    return responder(res, 200, { idDesafio });
  }

  if (req.method === 'POST' && url.pathname === '/api/otp') {
    const { idDesafio, codigo } = (await leerJson(req)) || {};
    const desafio = desafios.get(idDesafio);
    if (!desafio || desafio.codigo !== String(codigo)) return responder(res, 401, { error: 'Código incorrecto' });
    desafios.delete(idDesafio);
    const token = crypto.randomUUID();
    sesiones.set(token, {
      usuario: desafio.usuario,
      cuentas: [
        { numero: '1000000001', tipo: 'Ahorros', saldo: 1500000 },
        { numero: '1000000002', tipo: 'Corriente', saldo: 250000 },
      ],
    });
    return responder(res, 200, { token, nombre: USUARIOS[desafio.usuario].nombre });
  }

  if (req.method === 'GET' && url.pathname === '/api/buzon') {
    return responder(res, 200, buzon.get(url.searchParams.get('usuario')) || []);
  }

  const sesion = sesionDe(req);
  if (!sesion) return responder(res, 401, { error: 'Sesión no válida' });

  if (req.method === 'GET' && url.pathname === '/api/cuentas') {
    // Tarda a propósito, como un servicio real: sirve para aprender a esperar sin pausas fijas.
    return setTimeout(() => responder(res, 200, sesion.cuentas), 600);
  }

  if (req.method === 'GET' && url.pathname === '/api/v2/cuentas') {
    // Migración simulada (S3): el servicio nuevo entrega los mismos datos con otros nombres de campo.
    const cuentas = sesion.cuentas.map((c) => ({ id: c.numero, producto: PRODUCTOS_V2[c.tipo], saldoDisponible: c.saldo }));
    return responder(res, 200, { cuentas });
  }

  if (req.method === 'POST' && url.pathname === '/api/transferencias') {
    const { origen, destino, monto } = (await leerJson(req)) || {};
    const cuenta = sesion.cuentas.find((c) => c.numero === origen);
    if (!cuenta) return responder(res, 400, { error: 'La cuenta de origen no existe' });
    const error = validarTransferencia({ origen, destino, monto, saldo: cuenta.saldo });
    if (error) return responder(res, 400, { error });
    const gmf = calcularGmf(monto);
    cuenta.saldo -= cuenta.tipo === 'Corriente' ? monto : monto + gmf;
    return responder(res, 201, { comprobante: crypto.randomInt(100000, 1000000), monto, gmf, total: monto + gmf, saldo: cuenta.saldo });
  }

  return responder(res, 404, { error: 'No existe' });
}

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return api(req, res, url);
  const archivo = PAGINAS[url.pathname];
  if (!archivo) { res.writeHead(404); return res.end('No existe'); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] });
  fs.createReadStream(path.join(PUBLICO, archivo)).pipe(res);
}).listen(PUERTO, '127.0.0.1', () => console.log(`Banco Demo en http://127.0.0.1:${PUERTO}`));
