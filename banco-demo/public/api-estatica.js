// Versión en línea: el "servidor" corre dentro de tu navegador. Ningún dato sale de tu equipo.
window.apiEstatica = (() => {
  const { calcularGmf, validarTransferencia } = window.ReglasBanco;
  const USUARIOS = {
    ana: { clave: 'Clave123', nombre: 'Ana Pérez' },
    luis: { clave: 'Clave123', nombre: 'Luis Gómez' },
    bloqueado: { clave: 'Clave123', nombre: 'Usuario Bloqueado', bloqueado: true },
  };
  const PRODUCTOS_V2 = { Ahorros: 'Ahorros', Corriente: 'Ahorros' };
  const leer = (k, d) => JSON.parse(localStorage.getItem('demo:' + k) || JSON.stringify(d));
  const guardar = (k, v) => localStorage.setItem('demo:' + k, JSON.stringify(v));
  const azar = () => String(Math.floor(100000 + Math.random() * 900000));
  const r = (estado, datos) => ({ estado, datos });

  return async (ruta, opciones = {}) => {
    const url = new URL(ruta, location.href);
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : {};
    const camino = url.pathname.slice(url.pathname.lastIndexOf('/api/'));

    if (camino === '/api/login') {
      const { usuario, clave } = cuerpo;
      if (!usuario || !clave) return r(400, { error: 'Usuario y clave son obligatorios' });
      const llave = String(usuario).toLowerCase();
      const datos = USUARIOS[llave];
      if (!datos || datos.clave !== clave) return r(401, { error: 'Usuario o clave incorrectos' });
      if (datos.bloqueado && usuario === 'bloqueado') return r(423, { error: 'Tu usuario está bloqueado. Comunícate con la línea de atención' });
      const idDesafio = azar();
      const codigo = azar();
      guardar('desafio:' + idDesafio, { usuario: llave, codigo });
      guardar('buzon:' + llave, [{ codigo, mensaje: `Banco Demo: tu código de seguridad es ${codigo}` }, ...leer('buzon:' + llave, [])].slice(0, 5));
      return r(200, { idDesafio });
    }
    if (camino === '/api/otp') {
      const desafio = leer('desafio:' + cuerpo.idDesafio, null);
      if (!desafio || desafio.codigo !== String(cuerpo.codigo)) return r(401, { error: 'Código incorrecto' });
      const token = azar();
      guardar('sesion:' + token, { usuario: desafio.usuario, cuentas: [
        { numero: '1000000001', tipo: 'Ahorros', saldo: 1500000 },
        { numero: '1000000002', tipo: 'Corriente', saldo: 250000 },
      ] });
      return r(200, { token, nombre: USUARIOS[desafio.usuario].nombre });
    }
    if (camino === '/api/buzon') return r(200, leer('buzon:' + url.searchParams.get('usuario'), []));

    const token = localStorage.getItem('token');
    const sesion = leer('sesion:' + token, null);
    if (!sesion) return r(401, { error: 'Sesión no válida' });
    if (camino === '/api/cuentas') {
      await new Promise((listo) => setTimeout(listo, 600));
      return r(200, sesion.cuentas);
    }
    if (camino === '/api/v2/cuentas') {
      // Migración simulada (S3): los mismos datos con otros nombres de campo.
      return r(200, { cuentas: sesion.cuentas.map((c) => ({ id: c.numero, producto: PRODUCTOS_V2[c.tipo], saldoDisponible: c.saldo })) });
    }
    if (camino === '/api/transferencias') {
      const { origen, destino, monto } = cuerpo;
      const cuenta = sesion.cuentas.find((c) => c.numero === origen);
      if (!cuenta) return r(400, { error: 'La cuenta de origen no existe' });
      const error = validarTransferencia({ origen, destino, monto, saldo: cuenta.saldo });
      if (error) return r(400, { error });
      const gmf = calcularGmf(monto);
      cuenta.saldo -= cuenta.tipo === 'Corriente' ? monto : monto + gmf;
      guardar('sesion:' + token, sesion);
      return r(201, { comprobante: azar(), monto, gmf, total: monto + gmf, saldo: cuenta.saldo });
    }
    return r(404, { error: 'No existe' });
  };
})();
