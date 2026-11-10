import { APIRequestContext } from '@playwright/test';
import { Usuario } from '../datos/usuarios';

/** Lo que responde el servicio: el código HTTP (200, 401...) y el JSON. */
export interface Respuesta<T> {
  estado: number;
  datos: T;
}

/** Cuenta, como la entrega la versión 1 del servicio: GET /api/cuentas */
export interface Cuenta {
  numero: string;
  tipo: string;
  saldo: number;
}

/** Cuenta, como la entrega la versión 2 (la migración): GET /api/v2/cuentas */
export interface CuentaV2 {
  id: string;
  producto: string;
  saldoDisponible: number;
}

/** Lo que responde el banco al transferir. Si algo falla, solo viene "error". */
export interface Comprobante {
  comprobante?: number;
  monto?: number;
  gmf?: number;
  total?: number;
  saldo?: number;
  error?: string;
}

/**
 * CAPA DE API: habla con los servicios del banco, como lo harías en Postman.
 *
 * ENCAPSULAMIENTO: el token de la sesión es "private". Esta clase lo guarda al validar
 * el OTP y lo agrega sola a cada petición. Las pruebas nunca tienen que manejarlo.
 */
export class ClienteBanco {
  private token?: string;

  constructor(private readonly request: APIRequestContext) {}

  /** POST /api/login. Si los datos son correctos, el banco envía un código al buzón. */
  async login(usuario: string, clave: string): Promise<Respuesta<{ idDesafio?: string; error?: string }>> {
    const respuesta = await this.request.post('/api/login', { data: { usuario, clave } });
    return { estado: respuesta.status(), datos: await respuesta.json() };
  }

  /** Lee en el buzón de pruebas el último código enviado al usuario. */
  async leerCodigo(usuario: string): Promise<string> {
    const respuesta = await this.request.get('/api/buzon', { params: { usuario } });
    const [ultimo] = await respuesta.json();
    if (!ultimo) throw new Error(`El buzón de ${usuario} está vacío: ¿hiciste login antes?`);
    return ultimo.codigo;
  }

  /** POST /api/otp. Si el código es correcto, guarda el token para las siguientes peticiones. */
  async otp(idDesafio: string, codigo: string): Promise<Respuesta<{ token?: string; nombre?: string; error?: string }>> {
    const respuesta = await this.request.post('/api/otp', { data: { idDesafio, codigo } });
    const datos = await respuesta.json();
    if (respuesta.status() === 200) this.token = datos.token;
    return { estado: respuesta.status(), datos };
  }

  /** Login + código del buzón + OTP, en un solo paso. Devuelve el token y el nombre del cliente. */
  async iniciarSesion(usuario: Usuario): Promise<{ token: string; nombre: string }> {
    const login = await this.login(usuario.usuario, usuario.clave);
    if (login.estado !== 200 || !login.datos.idDesafio) {
      throw new Error(`No se pudo iniciar sesión como ${usuario.usuario}: ${login.estado} ${login.datos.error}`);
    }
    const codigo = await this.leerCodigo(usuario.usuario);
    const otp = await this.otp(login.datos.idDesafio, codigo);
    if (otp.estado !== 200 || !otp.datos.token) throw new Error(`El código OTP no fue aceptado: ${otp.datos.error}`);
    return { token: otp.datos.token, nombre: otp.datos.nombre ?? '' };
  }

  /** GET /api/cuentas (versión 1). */
  async cuentas(): Promise<Respuesta<Cuenta[]>> {
    const respuesta = await this.request.get('/api/cuentas', { headers: this.encabezados() });
    return { estado: respuesta.status(), datos: await respuesta.json() };
  }

  /** GET /api/v2/cuentas (versión 2, después de la migración). */
  async cuentasV2(): Promise<Respuesta<{ cuentas: CuentaV2[] }>> {
    const respuesta = await this.request.get('/api/v2/cuentas', { headers: this.encabezados() });
    return { estado: respuesta.status(), datos: await respuesta.json() };
  }

  /** POST /api/transferencias con el token de la sesión. */
  async transferir(origen: string, destino: string, monto: number): Promise<Respuesta<Comprobante>> {
    // TODO RETO 4: envía la transferencia y devuelve { estado, datos }, igual que cuentas().
    //   - Método POST a '/api/transferencias'
    //   - En "data" van origen, destino y monto
    //   - En "headers" va this.encabezados(): así viaja el token sin que la prueba lo vea
    // Pista: copia login() y cambia la ruta, los datos y agrega los headers.
    // Cuando termines, borra la línea "throw" de abajo.
    throw new Error('PENDIENTE (S3): completa ClienteBanco.transferir — ver retos/S03.md, reto 4');
  }

  /** Arma el encabezado Authorization con el token guardado. Solo lo usa esta clase. */
  private encabezados(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
