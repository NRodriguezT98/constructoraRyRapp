# 📚 Guía: De Documentación Funcional a Manual de Usuario

> **Objetivo**: Convertir la documentación funcional en un manual de usuario final profesional

---

## 🎯 Visión General del Proceso

```
FASE 1: Durante Desarrollo
┌─────────────────────────┐
│ Documentar cada módulo  │ ✅ Ya iniciado
│ usando plantilla        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Agregar capturas de     │ 📸 Ir tomando mientras desarrollas
│ pantalla                │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Documentar flujos y     │ ✅ Ya iniciado
│ validaciones            │
└─────────────────────────┘

FASE 2: Al Finalizar Desarrollo
┌─────────────────────────┐
│ Revisar y actualizar    │ 🔄 Al finalizar
│ docs funcionales        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Generar manual de       │ 📖 Derivar de docs funcionales
│ usuario final           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Publicar en formato     │ 🌐 PDF, Web, Video
│ accesible               │
└─────────────────────────┘
```

---

## 📋 Estrategia Recomendada (3 Niveles)

### Nivel 1: Documentación Funcional (AHORA)
**Audiencia**: Desarrolladores y administradores técnicos
**Formato**: Markdown (archivos `.md`)
**Ubicación**: `docs/functional/modulos/`

**Contenido**:
- ✅ Funcionalidades técnicas completas
- ✅ Validaciones y reglas de negocio
- ✅ Integraciones entre módulos
- ✅ Permisos y roles
- ✅ Errores y soluciones

**Acción ahora**:
- [x] Plantilla creada (`PLANTILLA-MODULO.md`)
- [x] Ejemplo completo (`clientes.md`)
- [ ] Completar para otros 5 módulos

---

### Nivel 2: Guías de Procedimientos (DESPUÉS)
**Audiencia**: Usuarios administrativos (vendedores, gerentes)
**Formato**: Markdown simplificado
**Ubicación**: `docs/functional/guias/`

**Contenido**:
- Paso a paso con capturas
- Casos de uso específicos
- Troubleshooting básico

**Ejemplo**:
```
docs/functional/guias/
├── como-registrar-cliente.md
├── como-crear-negociacion.md
├── como-configurar-pagos.md
└── como-generar-reporte.md
```

---

### Nivel 3: Manual de Usuario Final (AL FINAL)
**Audiencia**: Usuarios finales sin conocimiento técnico
**Formato**: PDF profesional + Sitio web
**Ubicación**: `docs/user-manual/`

**Contenido**:
- Lenguaje simple y claro
- Muchas imágenes y GIFs
- Videos tutoriales
- Búsqueda y navegación fácil

---

## 🛠️ Herramientas Recomendadas

### Para Durante el Desarrollo

#### 1. **Tomar Capturas** (Ahora)
**Herramienta**: ShareX, Lightshot, o Snagit
**Nombramiento**:
```
screenshots/
├── clientes/
│   ├── 01-lista-principal.png
│   ├── 02-formulario-crear.png
│   ├── 03-detalle-cliente.png
│   └── 04-modal-interes.png
├── proyectos/
└── viviendas/
```

#### 2. **Grabar Videos Cortos** (Opcional)
**Herramienta**: Loom, OBS Studio
**Duración**: 1-3 minutos por funcionalidad
**Uso**: Embeber en manual final

#### 3. **Markdown con Plantilla**
**Herramienta**: VSCode con extensión Markdown Preview
**Ventaja**: Consistencia en toda la documentación

---

### Para Generar Manual Final

#### 1. **MkDocs** (Recomendado ⭐)
**Qué es**: Generador de sitios de documentación estáticos
**Por qué**:
- ✅ Convierte Markdown a sitio web profesional
- ✅ Búsqueda integrada
- ✅ Responsive y moderno
- ✅ Temas listos (Material, ReadTheDocs)

**Ejemplo de estructura**:
```yaml
# mkdocs.yml
site_name: Manual de Usuario - RyR Constructora
theme:
  name: material
  palette:
    primary: purple
  features:
    - navigation.tabs
    - search.highlight

nav:
  - Inicio: index.md
  - Módulos:
    - Clientes: modulos/clientes.md
    - Proyectos: modulos/proyectos.md
    - Viviendas: modulos/viviendas.md
  - Guías:
    - Registrar Cliente: guias/registrar-cliente.md
    - Crear Negociación: guias/crear-negociacion.md
  - Preguntas Frecuentes: faq.md
```

**Resultado**: Sitio web como `docs.ryrconstruccion.com`

---

#### 2. **Docusaurus** (Alternativa)
**Qué es**: Framework de documentación de Facebook
**Por qué**:
- ✅ Más personalizable
- ✅ Soporte para React components
- ✅ Versiones de documentación

**Mejor para**: Si necesitas interactividad avanzada

---

#### 3. **Markdown to PDF** (Para versión impresa)
**Herramienta**: Pandoc + LaTeX
**Comando**:
```bash
pandoc manual-completo.md -o manual-usuario-ryr.pdf \
  --pdf-engine=xelatex \
  --toc \
  --number-sections
```

**Resultado**: PDF profesional listo para imprimir

---

## 📸 Sistema de Capturas de Pantalla

### Estructura Recomendada

```
docs/
├── screenshots/
│   ├── clientes/
│   │   ├── 01-vista-lista.png
│   │   ├── 02-filtros.png
│   │   ├── 03-formulario-crear.png
│   │   ├── 04-validacion-error.png
│   │   ├── 05-detalle-tabs.png
│   │   └── 06-modal-interes.png
│   ├── proyectos/
│   ├── viviendas/
│   ├── abonos/
│   ├── documentos/
│   └── procesos/
└── videos/
    ├── clientes/
    │   ├── crear-cliente.mp4
    │   └── registrar-interes.mp4
    └── proyectos/
```

### Convenciones de Nombres

```
[numero]-[descripcion-corta].png

Ejemplos:
01-vista-principal.png
02-boton-nuevo-cliente.png
03-formulario-seccion-1.png
04-error-documento-duplicado.png
05-confirmacion-guardado.png
```

---

## ✍️ Proceso de Documentación Durante Desarrollo

### Workflow Recomendado

#### 1. **Al Crear Nueva Funcionalidad**
```markdown
1. ✅ Desarrollar funcionalidad
2. 📸 Tomar capturas de cada paso
3. 📝 Documentar en archivo del módulo:
   - Qué hace
   - Cómo acceder
   - Pasos detallados
   - Validaciones
   - Errores posibles
4. ✅ Guardar capturas en carpeta correcta
5. 🔗 Referenciar capturas en markdown
```

#### 2. **Checklist por Funcionalidad**
```markdown
- [ ] Funcionalidad implementada y probada
- [ ] Capturas tomadas (mínimo 3 por funcionalidad)
- [ ] Documentación funcional completa
- [ ] Validaciones documentadas
- [ ] Errores comunes identificados
- [ ] Flujo agregado a diagrama
- [ ] Integraciones con otros módulos explicadas
```

---

## 🎨 Plantilla de Guía de Usuario Final

### Ejemplo: "Cómo Registrar un Cliente"

```markdown
# 👤 Cómo Registrar un Nuevo Cliente

> Aprende a registrar clientes potenciales en el sistema en solo 5 pasos

---

## 📝 Antes de Comenzar

**Necesitarás**:
- ✅ Datos del cliente (nombre, documento, contacto)
- ✅ Cédula del cliente (archivo PDF o imagen)
- ✅ Acceso con rol de Vendedor o Administrador

**Tiempo estimado**: 3 minutos

---

## 🚀 Paso a Paso

### Paso 1: Acceder al Módulo de Clientes

1. Haz clic en **"Clientes"** en el menú lateral
2. Verás la lista de clientes existentes

![Vista principal](../screenshots/clientes/01-vista-lista.png)

---

### Paso 2: Abrir Formulario de Registro

1. Haz clic en el botón **"Nuevo Cliente"** (esquina superior derecha)
2. Se abrirá un modal con el formulario

![Botón Nuevo Cliente](../screenshots/clientes/02-boton-crear.png)

---

### Paso 3: Seleccionar Tipo de Cliente

Escoge el tipo de cliente:
- **Natural**: Personas físicas
- **Jurídico**: Empresas

![Selector de tipo](../screenshots/clientes/03-tipo-cliente.png)

💡 **Tip**: Esto determina qué campos se muestran después

---

### Paso 4: Completar Información

Llena los campos requeridos (marcados con *):

| Campo | Ejemplo | Nota |
|-------|---------|------|
| Nombres* | Juan Carlos | Solo letras |
| Apellidos* | Pérez Gómez | Solo si es Natural |
| Tipo documento* | CC | Cédula de Ciudadanía |
| Número* | 1234567890 | Debe ser único |
| Email* | juan@example.com | Se validará formato |
| Teléfono* | 3001234567 | 10 dígitos |

![Formulario completo](../screenshots/clientes/04-formulario.png)

---

### Paso 5: Subir Cédula

1. Haz clic en la zona de **"Subir Cédula"**
2. Selecciona el archivo (PDF o imagen)
3. Verás una previsualización

![Upload cédula](../screenshots/clientes/05-upload-cedula.png)

⚠️ **Importante**: Máximo 5MB, formatos: PDF, JPG, PNG

---

### Paso 6: Guardar Cliente

1. Haz clic en **"Guardar Cliente"**
2. Verás mensaje de confirmación
3. Serás redirigido al detalle del cliente

![Confirmación](../screenshots/clientes/06-confirmacion.png)

✅ **¡Listo!** Cliente registrado exitosamente

---

## ❓ Problemas Comunes

### "Ya existe un cliente con este documento"

**Solución**:
1. Verifica que el número de documento sea correcto
2. Busca el cliente existente
3. Si es el mismo, actualiza sus datos en lugar de crear uno nuevo

---

### "Formato de archivo no válido"

**Solución**:
1. Asegúrate de que el archivo sea PDF, JPG o PNG
2. Verifica que no supere 5MB
3. Convierte el archivo si es necesario

---

## 🎥 Video Tutorial

[Ver video: Cómo registrar un cliente](../videos/clientes/crear-cliente.mp4)

---

## ➡️ Siguientes Pasos

Ahora que has registrado un cliente, puedes:
- [Registrar interés en vivienda](registrar-interes.md)
- [Subir documentos adicionales](subir-documentos.md)
- [Configurar fuentes de pago](configurar-pagos.md)
```

---

## 📊 Comparación de Herramientas

| Herramienta | Nivel | Esfuerzo | Resultado | Recomendado |
|-------------|-------|----------|-----------|-------------|
| **Markdown** | Funcional | Bajo | Archivos .md | ✅ Ahora |
| **MkDocs** | Usuario Final | Medio | Sitio web | ✅ Al final |
| **Docusaurus** | Usuario Final | Alto | Sitio interactivo | Si necesitas React |
| **Pandoc PDF** | Usuario Final | Bajo | PDF profesional | ✅ Al final |
| **Notion** | Ambos | Bajo | Base de conocimiento | Opcional |
| **GitBook** | Ambos | Medio | Docs versionadas | Opcional |

---

## 🗓️ Plan de Acción Recomendado

### Semana 1-4 (Durante Desarrollo)
```markdown
✅ Usar plantilla de módulo
✅ Documentar cada funcionalidad al crearla
✅ Tomar capturas mientras desarrollas
✅ Completar secciones de validaciones y errores
```

### Semana 5-6 (Finalizar Funcional)
```markdown
□ Revisar y actualizar toda la documentación funcional
□ Organizar capturas de pantalla
□ Crear diagramas de flujo finales
□ Grabar videos cortos (opcional)
```

### Semana 7-8 (Generar Manual de Usuario)
```markdown
□ Crear guías simplificadas
□ Configurar MkDocs o similar
□ Generar sitio web de documentación
□ Generar PDF con Pandoc
□ Publicar en dominio interno
```

---

## 💡 Consejos Finales

### ✅ HACER

1. **Documentar mientras desarrollas**
   - Es más fácil que hacerlo todo al final
   - Tienes el contexto fresco

2. **Tomar capturas limpias**
   - Sin información sensible
   - Con datos de ejemplo realistas
   - Resolución consistente

3. **Usar lenguaje simple**
   - Evitar jerga técnica
   - Explicar términos especializados
   - Usar ejemplos concretos

4. **Crear índice claro**
   - Navegación fácil
   - Búsqueda implementada
   - Links entre secciones

### ❌ EVITAR

1. **No dejar para el final**
   - Documentar todo al final es abrumador
   - Se olvidan detalles importantes

2. **No usar capturas pixeladas**
   - Mala imagen profesional
   - Dificulta seguimiento

3. **No documentar "lo obvio"**
   - Lo obvio para ti no lo es para usuarios nuevos
   - Documentar cada paso

---

## 🎯 Resultado Final Esperado

Al terminar, tendrás:

```
✅ Documentación funcional completa (6 módulos)
✅ Biblioteca de capturas organizadas (100+ imágenes)
✅ Videos tutoriales cortos (opcional)
✅ Sitio web de documentación (MkDocs)
✅ Manual de usuario en PDF
✅ Guías de inicio rápido
✅ FAQ completo
```

**Tiempo total estimado**:
- Documentación funcional: 2-3 horas por módulo = 12-18 horas
- Manual de usuario final: 1 semana

**Beneficio**:
- ✅ Onboarding rápido de nuevos usuarios
- ✅ Menos consultas de soporte
- ✅ Profesionalismo y credibilidad
- ✅ Escalabilidad del negocio

---

## 📞 Recursos Adicionales

**Herramientas**:
- MkDocs: https://www.mkdocs.org/
- Material for MkDocs: https://squidfunk.github.io/mkdocs-material/
- Pandoc: https://pandoc.org/
- Loom (videos): https://www.loom.com/

**Ejemplos de buenas documentaciones**:
- Stripe: https://stripe.com/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

---

**Creado**: 27 de Octubre, 2025
**Última actualización**: 27 de Octubre, 2025
