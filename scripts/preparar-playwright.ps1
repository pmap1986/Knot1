# Deja lista una terminal para correr Playwright en equipos corporativos (Windows).
# No pide administrador y no cambia variables de entorno permanentes: el PATH vale solo
# para esta terminal. La forma facil de usarlo es doble clic en preparar.cmd.
#
# Este archivo es solo ASCII a proposito: Windows PowerShell 5.1 lee como ANSI los
# archivos sin BOM. No le agregues tildes ni emojis.
#
# Se carga con punto (". .\script") para que el PATH quede en la terminal.
# Por eso usa return y nunca exit: exit cerraria la ventana y no se veria el error.

$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }
try { [Net.WebRequest]::DefaultWebProxy.Credentials = [Net.CredentialCache]::DefaultNetworkCredentials } catch { }
$global:PreparacionOk = $false

function Write-Ruta2 {
  Write-Host ''
  Write-Host 'Este equipo no deja correr Playwright aqui. No pasa nada: toma la Ruta 2 (nube) o la Ruta 3 (navegador).' -ForegroundColor Yellow
  Write-Host 'Abre el README (seccion Como empezar) o sigue el enlace del chat, y escribe en el chat: RUTA 2 o RUTA 3.' -ForegroundColor Yellow
}

function Test-Node {
  # Comprueba que node de verdad corre y que tiene la version minima.
  # AppLocker puede bloquear el programa aunque el archivo exista.
  try {
    $version = (& node -v 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $version) { return $false }
    $mayor = [int](($version -replace '^v', '').Split('.')[0])
    if ($mayor -lt 20) { Write-Host "[AVISO] Node $version es muy antiguo: se necesita 20 o superior." -ForegroundColor Yellow; return $false }
    return $true
  } catch { return $false }
}

function Find-Node {
  if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Node)) { return $true }
  # El instalador pudo terminar bien sin que esta terminal lo reconozca.
  $candidatos = @("$env:ProgramFiles\nodejs", "$env:LOCALAPPDATA\Programs\nodejs")
  $portables = Join-Path $HOME 'tools'
  if (Test-Path $portables) {
    $candidatos += Get-ChildItem $portables -Directory -Filter 'node-v*' |
      Sort-Object { [version](($_.Name -replace '^node-v', '') -replace '-win-.*$', '') } -Descending |
      ForEach-Object { $_.FullName }
  }
  foreach ($carpeta in $candidatos) {
    if (Test-Path (Join-Path $carpeta 'node.exe')) {
      $env:Path = "$carpeta;$env:Path"
      if (Test-Node) { Write-Host "[OK]    Node encontrado en $carpeta" -ForegroundColor Green; return $true }
    }
  }
  return $false
}

function Install-NodePortable {
  Write-Host '        Descargando Node portable en tu carpeta de usuario (sin administrador). Tarda 1 o 2 minutos...'
  try {
    $lista = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json' -UseBasicParsing -ErrorAction Stop
    $version = ($lista | Where-Object { $_.lts } | Select-Object -First 1).version
    $archivo = "node-$version-win-x64.zip"
    $zip = Join-Path $env:TEMP $archivo
    Invoke-WebRequest -Uri "https://nodejs.org/dist/$version/$archivo" -OutFile $zip -UseBasicParsing -ErrorAction Stop

    $sumas = Join-Path $env:TEMP 'node-shasums.txt'
    Invoke-WebRequest -Uri "https://nodejs.org/dist/$version/SHASUMS256.txt" -OutFile $sumas -UseBasicParsing -ErrorAction Stop
    $linea = Get-Content $sumas | Where-Object { $_ -match [regex]::Escape($archivo) } | Select-Object -First 1
    if (-not $linea -or $linea.Split(' ')[0] -ine (Get-FileHash $zip -Algorithm SHA256).Hash) {
      throw 'el archivo descargado no coincide con su checksum'
    }

    $destino = Join-Path $HOME 'tools'
    New-Item -ItemType Directory -Force -Path $destino | Out-Null
    if (Get-Command tar.exe -ErrorAction SilentlyContinue) { & tar.exe -xf $zip -C $destino }
    else { Expand-Archive -Path $zip -DestinationPath $destino -Force }
    Remove-Item $zip, $sumas -Force -ErrorAction SilentlyContinue
    return (Find-Node)
  } catch {
    Write-Host "[FALTA] No se pudo descargar Node: $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

function Invoke-Humo {
  & npx.cmd playwright test inicio.spec --project=ui --reporter=line | Out-Host
  return ($LASTEXITCODE -eq 0)
}

function Get-NavegadorInstalado {
  $edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
  $chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
  $lista = @()
  if ($edge | Where-Object { Test-Path $_ }) { $lista += 'msedge' }
  if ($chrome | Where-Object { Test-Path $_ }) { $lista += 'chrome' }
  return $lista
}

function Start-Preparacion {
  if ($ExecutionContext.SessionState.LanguageMode -ne 'FullLanguage') {
    Write-Host "[FALTA] La politica del equipo limita PowerShell ($($ExecutionContext.SessionState.LanguageMode))." -ForegroundColor Red
    Write-Ruta2
    return
  }
  # El proyecto de Playwright vive en la raiz del repo, una carpeta arriba de scripts.
  $proyecto = Split-Path $PSScriptRoot -Parent
  if ($proyecto -match 'OneDrive') {
    Write-Host '[AVISO] El proyecto esta dentro de OneDrive: si algo falla, muevelo a $HOME\dev.' -ForegroundColor Yellow
  }
  Set-Location $proyecto

  if (-not (Find-Node) -and -not (Install-NodePortable)) {
    Write-Host '        Tambien puedes instalar Node.js desde el Portal de Empresa y reiniciar el equipo.'
    Write-Ruta2
    return
  }
  Write-Host "[OK]    Node $(& node -v)" -ForegroundColor Green

  if (-not (Test-Path 'node_modules\@playwright\test')) {
    Write-Host '        Instalando dependencias del proyecto (npm ci)...'
    & npm.cmd ci --no-audit --no-fund | Out-Host
    if ($LASTEXITCODE -ne 0) {
      Write-Host '[AVISO] npm ci fallo. Reintento con los certificados de Windows.' -ForegroundColor Yellow
      $env:NODE_OPTIONS = '--use-system-ca'
      & npm.cmd ci --no-audit --no-fund | Out-Host
    }
    if ($LASTEXITCODE -ne 0) {
      Remove-Item Env:\NODE_OPTIONS -ErrorAction SilentlyContinue
      Write-Host '[FALTA] npm ci fallo: la red o el proxy bloquean las dependencias.' -ForegroundColor Red
      Write-Ruta2
      return
    }
  }
  Write-Host '[OK]    Dependencias del proyecto' -ForegroundColor Green

  $listo = $false
  Remove-Item Env:\PW_CHANNEL -ErrorAction SilentlyContinue
  & npx.cmd playwright install chromium | Out-Host
  if ($LASTEXITCODE -eq 0) {
    Write-Host 'Prueba de humo con Chromium: tests/ui/inicio.spec.ts' -ForegroundColor Cyan
    $listo = Invoke-Humo
  } else {
    Write-Host '[AVISO] La red no dejo descargar Chromium.' -ForegroundColor Yellow
  }
  if (-not $listo) {
    foreach ($navegador in (Get-NavegadorInstalado)) {
      Write-Host "Prueba de humo con el navegador instalado: $navegador" -ForegroundColor Cyan
      $env:PW_CHANNEL = $navegador
      if (Invoke-Humo) { $listo = $true; break }
    }
  }
  if (-not $listo) {
    Remove-Item Env:\PW_CHANNEL -ErrorAction SilentlyContinue
    Write-Host '[FALTA] La prueba de humo no paso con ningun navegador.' -ForegroundColor Red
    Write-Ruta2
    return
  }

  $global:PreparacionOk = $true
  Write-Host ''
  Write-Host 'LISTO. Escribe en el chat: RUTA 1 LISTA. Deja esta ventana abierta: el PATH vale solo aqui.' -ForegroundColor Green
  Write-Host 'Tus retos: npm.cmd run retos:s03     Todo el repo: npm.cmd run verificar-clase     Evidencias: npm.cmd run evidencias'
}

Start-Preparacion
