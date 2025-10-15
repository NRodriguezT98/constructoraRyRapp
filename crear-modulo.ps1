# Script para Generar Nuevo Módulo
# Uso: .\crear-modulo.ps1 -nombre "NombreModulo"

param(
    [Parameter(Mandatory = $true)]
    [string]$nombre
)

$nombreLower = $nombre.ToLower()
$nombrePascal = (Get-Culture).TextInfo.ToTitleCase($nombre)

Write-Host "Creando modulo: $nombrePascal" -ForegroundColor Cyan

# Crear estructura de carpetas
$basePath = "src\modules\$nombreLower"

$folders = @(
    "$basePath\components",
    "$basePath\components\tabs",
    "$basePath\hooks",
    "$basePath\services",
    "$basePath\store",
    "$basePath\types",
    "$basePath\styles",
    "$basePath\constants"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "Creada carpeta: $folder" -ForegroundColor Green
}

# Crear types/index.ts
$typesPath = Join-Path $basePath "types\index.ts"
$typesLines = @(
    "/**",
    " * Tipos TypeScript para modulo $nombrePascal",
    " */",
    "",
    "export interface $nombrePascal {",
    "  id: string",
    "  nombre: string",
    "  descripcion?: string",
    "  fecha_creacion: string",
    "  fecha_actualizacion: string",
    "}",
    "",
    "export interface ${nombrePascal}FormData {",
    "  nombre: string",
    "  descripcion?: string",
    "}",
    "",
    "export interface Filtro$nombrePascal {",
    "  busqueda?: string",
    "}",
    "",
    "export type Vista$nombrePascal = ""grid"" | ""lista"""
)
$typesLines | Out-File -FilePath $typesPath -Encoding UTF8
Write-Host "Creado: types/index.ts" -ForegroundColor Green

# Crear components/index.ts
$componentsPath = Join-Path $basePath "components\index.ts"
$componentsLines = @(
    "// Barrel exports para componentes de $nombreLower",
    "export { ${nombrePascal}Page } from './${nombreLower}-page-main'",
    "export { ${nombrePascal}Card } from './${nombreLower}-card'"
)
$componentsLines | Out-File -FilePath $componentsPath -Encoding UTF8
Write-Host "Creado: components/index.ts" -ForegroundColor Green

# Crear hooks/index.ts
$hooksPath = Join-Path $basePath "hooks\index.ts"
$hooksLines = @(
    "// Barrel exports para hooks de $nombreLower",
    "export { use${nombrePascal}s } from './use${nombrePascal}s'",
    "export { use${nombrePascal}Card } from './use${nombrePascal}Card'"
)
$hooksLines | Out-File -FilePath $hooksPath -Encoding UTF8
Write-Host "Creado: hooks/index.ts" -ForegroundColor Green

# Crear styles/index.ts
$stylesPath = Join-Path $basePath "styles\index.ts"
$stylesLines = @(
    "// Barrel exports para estilos de $nombreLower",
    "export * from './classes'",
    "export * from './animations'"
)
$stylesLines | Out-File -FilePath $stylesPath -Encoding UTF8
Write-Host "Creado: styles/index.ts" -ForegroundColor Green

# Crear README.md
$readmePath = Join-Path $basePath "README.md"
$fecha = Get-Date -Format "yyyy-MM-dd"
$readmeLines = @(
    "# Modulo: $nombrePascal",
    "",
    "## Descripcion",
    "[Descripcion del modulo]",
    "",
    "## Componentes",
    "- [ ] ${nombrePascal}Page",
    "- [ ] ${nombrePascal}Card",
    "- [ ] ${nombrePascal}Form",
    "- [ ] ${nombrePascal}Lista",
    "",
    "## Hooks",
    "- [ ] use${nombrePascal}s",
    "- [ ] use${nombrePascal}Card",
    "",
    "## Estado",
    "- [ ] Store de Zustand",
    "- [ ] Servicio de API",
    "",
    "## Checklist de Implementacion",
    "",
    "### 1. Tipos y Modelos",
    "- [ ] Definir interfaces en types/index.ts",
    "- [ ] Agregar tipos de respuesta API",
    "- [ ] Definir tipos de formularios",
    "",
    "### 2. Servicios",
    "- [ ] Crear ${nombreLower}.service.ts",
    "- [ ] Implementar metodos CRUD",
    "- [ ] Agregar manejo de errores",
    "",
    "### 3. Estado Global",
    "- [ ] Crear ${nombreLower}.store.ts (Zustand)",
    "- [ ] Definir estado inicial",
    "- [ ] Crear acciones",
    "",
    "### 4. Hooks Personalizados",
    "- [ ] use${nombrePascal}s (hook principal)",
    "- [ ] use${nombrePascal}Card (para tarjetas)",
    "- [ ] use${nombrePascal}Form (para formularios)",
    "",
    "### 5. Componentes",
    "- [ ] ${nombrePascal}Page (pagina principal)",
    "- [ ] ${nombrePascal}Card (tarjeta de item)",
    "- [ ] ${nombrePascal}Form (formulario)",
    "- [ ] ${nombrePascal}Lista (lista de items)",
    "",
    "### 6. Estilos",
    "- [ ] classes.ts (clases reutilizables)",
    "- [ ] animations.ts (animaciones Framer Motion)",
    "- [ ] ${nombreLower}-card.styles.ts (estilos del card)",
    "",
    "## Referencias",
    "- **Guia de Estilos**: docs/GUIA-ESTILOS.md",
    "- **Modulo Ejemplo**: src/modules/proyectos/",
    "- **Instrucciones Copilot**: .github/copilot-instructions.md",
    "",
    "---",
    "",
    "**Creado**: $fecha",
    "**Patron**: Clean Architecture con Separation of Concerns"
)
$readmeLines | Out-File -FilePath $readmePath -Encoding UTF8
Write-Host "Creado: README.md" -ForegroundColor Green

Write-Host ""
Write-Host "Modulo $nombrePascal creado exitosamente!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ubicacion: $basePath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Definir tipos en types/index.ts"
Write-Host "  2. Crear servicio en services/${nombreLower}.service.ts"
Write-Host "  3. Crear store en store/${nombreLower}.store.ts"
Write-Host "  4. Crear hooks en hooks/"
Write-Host "  5. Crear componentes en components/"
Write-Host ""
Write-Host "Referencias:" -ForegroundColor Yellow
Write-Host "  - Guia: docs/GUIA-ESTILOS.md"
Write-Host "  - Ejemplo: src/modules/proyectos/"
Write-Host "  - Sistema: docs/CODIGO-LIMPIO-SISTEMA.md"
Write-Host ""
