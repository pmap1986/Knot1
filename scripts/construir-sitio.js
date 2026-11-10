// Arma la carpeta sitio/ que se publica en GitHub Pages: la portada, el banco en línea, la calculadora y las evidencias.
// El banco en línea no tiene servidor: api-estatica.js hace de servidor dentro del navegador.
const fs = require('fs');
const path = require('path');

const SALIDA = 'sitio';
const BANCO = path.join(SALIDA, 'banco');
const PUBLICO = path.join('banco-demo', 'public');
fs.rmSync(SALIDA, { recursive: true, force: true });
fs.mkdirSync(BANCO, { recursive: true });

const NOMBRES = { login: 'index', otp: 'otp', inicio: 'inicio', transferir: 'transferir', buzon: 'buzon' };
for (const [origen, destino] of Object.entries(NOMBRES)) {
  const html = fs.readFileSync(path.join(PUBLICO, `${origen}.html`), 'utf8')
    .replace('href="/estilos.css"', 'href="estilos.css"')
    .replace('<script src="/comun.js"></script>', '<script src="reglas.js"></script><script src="api-estatica.js"></script><script src="comun.js"></script>')
    .replace(/href="\/(otp|inicio|transferir|buzon)"/g, 'href="$1.html"')
    .replace(/location\.href = '\/(otp|inicio)'/g, "location.href = '$1.html'");
  fs.writeFileSync(path.join(BANCO, `${destino}.html`), html);
}
fs.copyFileSync(path.join(PUBLICO, 'estilos.css'), path.join(BANCO, 'estilos.css'));
fs.copyFileSync(path.join(PUBLICO, 'api-estatica.js'), path.join(BANCO, 'api-estatica.js'));
fs.writeFileSync(path.join(BANCO, 'comun.js'), fs.readFileSync(path.join(PUBLICO, 'comun.js'), 'utf8').replace(/location\.href = '\/'/g, "location.href = 'index.html'"));
fs.writeFileSync(path.join(BANCO, 'reglas.js'),
  `(() => { const module = { exports: {} };\n${fs.readFileSync('banco-demo/reglas.js', 'utf8')}\nwindow.ReglasBanco = module.exports; })();\n`);

if (fs.existsSync('evidencias.html')) fs.copyFileSync('evidencias.html', path.join(SALIDA, 'evidencias.html'));
fs.copyFileSync(path.join('banco-demo', 'calculadora.html'), path.join(SALIDA, 'calculadora.html'));
fs.copyFileSync(path.join('banco-demo', 'portada.html'), path.join(SALIDA, 'index.html'));
console.log('sitio/ listo');
