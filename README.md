# knot-qa-framework

Framework de automatización de práctica del **Bootcamp de QA & Automatización · Knot Academy × Accenture**. Desde la S3 lo construimos por capas, con clases y principios SOLID, usando Playwright y TypeScript sobre el **Banco Demo**: un banco de práctica que corre en tu equipo, sin internet, con login, código OTP, saldos, transferencias y 4x1000. El Banco Demo tiene bugs sembrados a propósito: no los corrijas.

## Cómo empezar

| Ruta | Necesitas | Pasos |
|---|---|---|
| **1 · En tu equipo** | Poder ejecutar programas | Descarga el repo (**Code → Download ZIP**), clic derecho en el ZIP → **Propiedades → Desbloquear**, extráelo fuera de OneDrive y haz **doble clic en `preparar.cmd`**. Cuando diga **LISTO**, en esa misma ventana: `npm.cmd run retos:s03` |
| **2 · En la nube** | Una cuenta personal de GitHub | **Use this template → Create a new repository**. En tu copia, abre el archivo del reto y edítalo con el lápiz ✏️ → **Commit changes**. En la pestaña **Actions** verás la verificación; abajo, en **Artifacts**, descarga `evidencias.html` |
| **3 · Solo navegador** | Un navegador | Lee el código y los retos aquí en GitHub y explora el [Banco Demo en línea](https://coach1-knotacademy.github.io/knot-qa-framework/banco/index.html) (`ana` / `Clave123`) |

Si la Ruta 1 no funciona en 5 minutos, pasa a la 2. Si GitHub tampoco abre, ve a la 3.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm test` | Corre todas las pruebas (el Banco Demo se inicia solo) |
| `npm run retos:s03` · `npm run retos:s04` | Corre solo los retos de esa sesión |
| `npm run verificar-clase` | Revisa todo y muestra una tabla: pruebas base, retos y hallazgos. Con `-- s03-inicio` (o `s03-solucion`, `s04-inicio`, `s04-solucion`) exige exactamente el estado de esa etiqueta |
| `npm run evidencias` | Crea `evidencias.html` con los resultados y pantallazos |
| `npm run demo` | Abre el Banco Demo para explorarlo a mano en http://127.0.0.1:4000 |
| `npm run grabar` | Graba pasos con codegen (antes, deja `npm run demo` abierto en otra ventana) |

En Windows PowerShell escribe `npm.cmd` en lugar de `npm`.

## Capas

| Carpeta | Responde a | Ejemplo |
|---|---|---|
| `tests/` | ¿Qué se prueba? | `tests/ui/inicio.spec.ts` |
| `src/soporte/` | ¿Cómo recibe cada prueba sus piezas? | fixtures: `paginaLogin`, `cliente` |
| `src/flujos/` | ¿Qué pasos de negocio se repiten? | `iniciarSesionPorUi`, `abrirConSesion` |
| `src/paginas/` | ¿Cómo se usa cada pantalla? | `PaginaLogin.ingresar()` |
| `src/api/` | ¿Cómo se llama a cada servicio? | `ClienteBanco.cuentas()` |
| `src/config/` · `src/datos/` | ¿Dónde está el sistema y con qué datos? | `entorno.urlBase`, `usuarios.ana` |

Explicación y diagrama: [`docs/arquitectura.md`](docs/arquitectura.md). Para ver el "antes", abre [`tests/antes/espagueti.spec.ts`](tests/antes/espagueti.spec.ts).

## Sesiones

| Sesión | Tema | Qué crece |
|---|---|---|
| S3 | Arquitectura por capas y clases | `src/paginas`, `src/api`, `src/flujos` · [retos/S03.md](retos/S03.md) |
| S4 | Principios SOLID | `src/legado` y `tests/retos-s04` · `retos/S04.md` (se publica el jueves) |
| S5 | Patrones de diseño | `src/flujos` y `src/soporte` (fábricas, constructores de datos) |
| S6 | Configuración y localizadores | `src/config` (ambientes) y `src/paginas` (localizadores robustos) |
| S7 | BDD | `features/` con escenarios Gherkin que llaman a `src/flujos` |
| S8 | Datos de prueba y Allure | `src/datos` (CSV y generadores) y reporte Allure |
| S9 | Logging | `src/soporte` (bitácora de cada paso) |
| S10 | CI/CD | `.github/workflows` (pipeline completo) |

## Puntos de partida

Cada sesión tiene una etiqueta: `s03-inicio`, `s03-solucion`, `s04-inicio`, `s04-solucion`. Si te atrasaste, empieza desde la etiqueta de la sesión:

```
git stash -u
git fetch --tags
git switch -c mi-s04 s04-inicio
```
