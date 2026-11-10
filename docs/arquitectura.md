# Arquitectura del framework

Un framework de automatización separa **qué se prueba** de **cómo se habla con el sistema**. Cada capa tiene una sola tarea y solo conoce a la capa de abajo.

```
  tests/                  QUÉ se prueba. Se lee como el caso manual. Sin localizadores.
     │  pide piezas a
     ▼
  src/soporte/            Fixtures: entregan las piezas ya armadas a cada prueba.
     │  arma
     ▼
  src/flujos/             Pasos de negocio que combinan varias piezas: "iniciar sesión".
     │  usa
     ▼
  src/paginas/  src/api/  CÓMO se habla con el sistema:
                          páginas → la pantalla (localizadores y acciones)
                          api     → los servicios (rutas, JSON, token)
     │  leen
     ▼
  src/config/  src/datos/ DÓNDE está el sistema y CON QUÉ datos se prueba.
     │
     ▼
  banco-demo/             El sistema bajo prueba. No es parte del framework.
```

## Qué va en cada carpeta

| Carpeta | Responde a | Ejemplo | Regla |
|---|---|---|---|
| `tests/` | ¿Qué se prueba? | `tests/ui/inicio.spec.ts` | Sin `getByLabel` ni URLs: solo pasos y resultados esperados. |
| `src/soporte/` | ¿Cómo recibe cada prueba sus piezas? | `fixtures.ts` | La prueba pide `paginaLogin`; no hace `new PaginaLogin(page)`. |
| `src/flujos/` | ¿Qué pasos de negocio se repiten? | `iniciarSesionPorUi`, `abrirConSesion` | Combina páginas y API. No tiene localizadores propios. |
| `src/paginas/` | ¿Cómo se usa cada pantalla? | `PaginaLogin.ingresar()` | Un archivo por pantalla. Los localizadores viven solo aquí. Sin `expect`. |
| `src/api/` | ¿Cómo se llama a cada servicio? | `ClienteBanco.cuentas()` | Guarda el token. Devuelve `{ estado, datos }`; no decide si está bien. |
| `src/config/` | ¿Dónde está el sistema? | `entorno.urlBase` | Todo valor que cambia entre ambientes sale de aquí, con variables de entorno. |
| `src/datos/` | ¿Con qué datos? | `usuarios.ana` | Nada de `'Clave123'` regado por las pruebas. |
| `src/legado/` (S4) | Código heredado para refactorizar | `AyudanteTodo` | Ejemplos de lo que SOLID evita. |

## Por qué así

Compara `tests/antes/espagueti.spec.ts` con `tests/ui/inicio.spec.ts`:

- **Si cambia la pantalla**, se corrige una página y no veinte pruebas.
- **Si cambia el ambiente**, se cambia una variable de entorno y no el código.
- **Si cambia el servicio** (como la migración a `/api/v2/cuentas`), se ajusta `ClienteBanco` y las pruebas siguen iguales.
- **Las pruebas se leen como el caso manual**: cualquiera del equipo puede revisarlas.

## Programación orientada a objetos en este repo

| Concepto | Dónde verlo |
|---|---|
| Clase y objeto | `PaginaInicio` es la clase (el molde); `new PaginaInicio(page)` crea un objeto. |
| Constructor | `constructor(page: Page)` en cada página: arma los localizadores una sola vez. |
| Herencia | `PaginaLogin extends PaginaBase`: recibe `abrir()` y `mensajeDeError` sin escribirlos. |
| Polimorfismo | `abrir()` está una sola vez en `PaginaBase` y abre una pantalla distinta según la `ruta` de cada hija. |
| Encapsulamiento | Los localizadores son `private`; el token de `ClienteBanco` también. Las pruebas no los tocan. |

## Cómo se marcan los bugs encontrados

Una prueba que encuentra un bug conocido llama a `hallazgoEsperado('BUG-01', '...')` (en `src/soporte/hallazgos.ts`). La prueba describe el comportamiento **correcto**; como el bug existe, falla, y Playwright la cuenta como "falla esperada". Así la suite queda en verde, el bug queda registrado en el reporte y, si algún día lo corrigen, Playwright avisa.
