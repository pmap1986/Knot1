// Reglas de negocio del Banco Demo. Las usan el servidor y las pruebas.

/** 4x1000: impuesto de 4 pesos por cada 1.000 transferidos, en pesos enteros. */
function calcularGmf(monto) {
  return Math.round((monto * 4) / 1000); // <-- LÍNEA DEL LAB: cambia round por floor
}

const MONTO_MINIMO = 1000;
const MONTO_MAXIMO = 2000000;

/** Devuelve el mensaje de error de la transferencia, o null si es válida. */
function validarTransferencia({ origen, destino, monto, saldo }) {
  if (!/^\d{10}$/.test(String(destino ?? ''))) return 'La cuenta destino debe tener 10 dígitos';
  if (String(destino) === String(origen)) return 'La cuenta destino debe ser diferente a la de origen';
  if (!Number.isInteger(monto) || monto <= 0) return 'El monto debe ser un número entero positivo';
  if (monto <= MONTO_MINIMO) return 'El monto mínimo es $1.000';
  if (monto > MONTO_MAXIMO) return 'El monto máximo por transferencia es $2.000.000';
  if (monto + calcularGmf(monto) > saldo) return 'Saldo insuficiente';
  return null;
}

module.exports = { calcularGmf, validarTransferencia, MONTO_MINIMO, MONTO_MAXIMO };
