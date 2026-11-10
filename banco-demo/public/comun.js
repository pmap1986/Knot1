const api = window.apiEstatica || (async (ruta, opciones = {}) => {
  const token = localStorage.getItem('token');
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return { estado: respuesta.status, datos: await respuesta.json().catch(() => ({})) };
});
const pesos = (n) => '$' + Number(n).toLocaleString('es-CO');
function pintarError(texto) {
  const caja = document.getElementById('error');
  caja.textContent = texto;
  caja.hidden = !texto;
}
function exigirSesion() {
  if (!localStorage.getItem('token')) location.href = '/';
  document.getElementById('nombre').textContent = localStorage.getItem('nombre') || '';
  document.getElementById('salir').onclick = () => { localStorage.clear(); location.href = '/'; };
}
