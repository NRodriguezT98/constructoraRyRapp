# ✅ Checklist de Testing - Sistema de Descuentos

**Fecha**: 2025-12-05
**Sistema**: Descuentos y Valor en Minuta
**Ambiente**: Desarrollo → Producción

---

## 🧪 Plan de Testing

### Fase 1: Testing Unitario (Backend)

#### Base de Datos

- [ ] **1.1 Triggers Funcionales**
  - [ ] Trigger `calcular_porcentaje_descuento` ejecuta al INSERT
  - [ ] Trigger calcula porcentaje correctamente: (14M / 122M) * 100 = 11.48
  - [ ] Trigger se ejecuta al UPDATE de descuento_aplicado
  - [ ] Trigger maneja caso descuento = 0 (porcentaje = 0)

  **SQL de Prueba**:
  ```sql
  -- Crear negociación de prueba
  INSERT INTO negociaciones (
    cliente_id, vivienda_id, valor_negociado, descuento_aplicado
  ) VALUES (
    'cliente-test-id', 'vivienda-test-id', 108000000, 14000000
  );

  -- Verificar porcentaje auto-calculado
  SELECT
    descuento_aplicado,
    porcentaje_descuento,
    ROUND((descuento_aplicado / (valor_negociado + descuento_aplicado)) * 100, 2) AS esperado
  FROM negociaciones
  WHERE id = 'negociacion-recien-creada';

  -- Resultado esperado: porcentaje_descuento = 11.48
  ```

- [ ] **1.2 Trigger Validación Motivo**
  - [ ] Bloquea INSERT con descuento > 0 sin motivo
  - [ ] Bloquea INSERT con motivo < 10 caracteres
  - [ ] Permite INSERT con motivo >= 10 caracteres
  - [ ] Permite INSERT con descuento = 0 sin motivo

  **SQL de Prueba**:
  ```sql
  -- ❌ Debe fallar: descuento sin motivo
  INSERT INTO negociaciones (
    cliente_id, vivienda_id, valor_negociado, descuento_aplicado
  ) VALUES (
    'cliente-id', 'vivienda-id', 108000000, 14000000
  );
  -- Esperado: ERROR "motivo_descuento debe tener al menos 10 caracteres"

  -- ❌ Debe fallar: motivo muy corto
  INSERT INTO negociaciones (
    cliente_id, vivienda_id, valor_negociado, descuento_aplicado, motivo_descuento
  ) VALUES (
    'cliente-id', 'vivienda-id', 108000000, 14000000, 'corto'
  );
  -- Esperado: ERROR "motivo_descuento debe tener al menos 10 caracteres"

  -- ✅ Debe pasar: motivo válido
  INSERT INTO negociaciones (
    cliente_id, vivienda_id, valor_negociado, descuento_aplicado, motivo_descuento
  ) VALUES (
    'cliente-id', 'vivienda-id', 108000000, 14000000, 'Trabajador con 5 años de antigüedad'
  );
  -- Esperado: SUCCESS
  ```

- [ ] **1.3 Constraints**
  - [ ] Constraint `chk_descuento_no_negativo` bloquea descuentos negativos
  - [ ] Constraint `chk_valor_escritura_positivo` bloquea escrituras <= 0
  - [ ] Permite NULL en valor_escritura_publica

  **SQL de Prueba**:
  ```sql
  -- ❌ Debe fallar: descuento negativo
  UPDATE negociaciones SET descuento_aplicado = -1000 WHERE id = '...';
  -- Esperado: ERROR violación constraint

  -- ❌ Debe fallar: escritura 0
  UPDATE negociaciones SET valor_escritura_publica = 0 WHERE id = '...';
  -- Esperado: ERROR violación constraint

  -- ✅ Debe pasar: escritura NULL
  UPDATE negociaciones SET valor_escritura_publica = NULL WHERE id = '...';
  -- Esperado: SUCCESS
  ```

- [ ] **1.4 Vista de Reportes**
  - [ ] Vista `vista_descuentos_aplicados` retorna datos correctos
  - [ ] Filtro `descuento_aplicado > 0` funciona
  - [ ] Joins con clientes/viviendas/manzanas/proyectos correctos
  - [ ] Campo `diferencia_notarial` calculado correctamente

  **SQL de Prueba**:
  ```sql
  -- Crear negociación con descuento
  INSERT INTO negociaciones (...) VALUES (...);

  -- Consultar vista
  SELECT * FROM vista_descuentos_aplicados WHERE cliente_id = '...';

  -- Verificar campos:
  -- ✅ nombre_completo del cliente
  -- ✅ vivienda numero
  -- ✅ proyecto nombre
  -- ✅ valor_original = valor_negociado + descuento_aplicado
  -- ✅ diferencia_notarial = valor_escritura - valor_negociado
  ```

- [ ] **1.5 Índices de Performance**
  - [ ] Índice `idx_clientes_tipo_numero_documento` mejora validación duplicados
  - [ ] Índice `idx_negociaciones_descuento_aplicado` mejora queries de descuentos
  - [ ] Índice `idx_negociaciones_tipo_descuento` mejora filtros por tipo

  **SQL de Prueba**:
  ```sql
  -- Verificar índices existen
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE tablename IN ('clientes', 'negociaciones')
  ORDER BY indexname;

  -- Esperado: 3 índices nuevos en la lista
  ```

---

### Fase 2: Testing Frontend (Componente)

#### UI/UX

- [ ] **2.1 Carga de Datos Inicial**
  - [ ] Al seleccionar vivienda, valores base se cargan automáticamente
  - [ ] `valor_base` muestra valor correcto desde BD
  - [ ] `gastos_notariales` muestra $5.000.000 (o valor custom)
  - [ ] `valor_total_original` se calcula correctamente (base + gastos)
  - [ ] Campos base son read-only (cursor-not-allowed)

- [ ] **2.2 Checkbox Toggle de Descuento**
  - [ ] Checkbox inicia desmarcado
  - [ ] Al marcar, sección de descuento se expande con animación
  - [ ] Al desmarcar, sección se colapsa y campos se limpian
  - [ ] Animación es fluida (no jumps ni flashes)
  - [ ] Transición dura ~300ms

- [ ] **2.3 Campos de Descuento**
  - [ ] InputCurrency `descuento_aplicado` formatea números correctamente
  - [ ] No permite ingresar descuento > valor_total_original
  - [ ] Select `tipo_descuento` muestra 7 opciones
  - [ ] Textarea `motivo_descuento` tiene contador 0/500
  - [ ] Textarea limita a 500 caracteres
  - [ ] Placeholder muestra ejemplo claro

- [ ] **2.4 Auto-Cálculos**
  - [ ] Porcentaje se calcula en tiempo real al cambiar monto
  - [ ] Fórmula correcta: (descuento / valor_total_original) * 100
  - [ ] Badge muestra porcentaje con 2 decimales
  - [ ] Resumen visual actualiza inmediatamente
  - [ ] Valor final = valor_total_original - descuento

- [ ] **2.5 Valor en Minuta**
  - [ ] Campo es editable
  - [ ] Formatea números con separador de miles
  - [ ] Placeholder muestra $128.000.000
  - [ ] Hint muestra texto "Sugerido: $128M (facilita crédito)"
  - [ ] No bloquea valores < valor_final (solo warning)

- [ ] **2.6 Alert Diferencia Notarial**
  - [ ] Se muestra solo si valor_escritura != valor_final
  - [ ] Badge azul si diferencia positiva (escritura > real)
  - [ ] Badge amarillo si diferencia negativa (escritura < real)
  - [ ] Muestra "solo en papel" si positiva
  - [ ] Muestra valores: Real, Minuta, Diferencia

- [ ] **2.7 Resumen Final**
  - [ ] Se muestra solo si valor_final > 0
  - [ ] Muestra "Base + Gastos"
  - [ ] Muestra "Descuento" solo si descuento > 0
  - [ ] Muestra "Valor Total a Pagar" destacado
  - [ ] Formato de moneda correcto (separador miles)

---

### Fase 3: Testing de Validaciones

#### Frontend (Zod Schema)

- [ ] **3.1 Validación de Descuento**
  - [ ] Error si descuento < 0
  - [ ] Error si descuento >= valor_total_original
  - [ ] Mensaje: "El descuento no puede ser mayor o igual al valor de la vivienda"

- [ ] **3.2 Validación de Tipo**
  - [ ] Error si descuento > 0 sin tipo_descuento
  - [ ] Mensaje: "Debes seleccionar un tipo de descuento"
  - [ ] No error si descuento = 0 sin tipo

- [ ] **3.3 Validación de Motivo**
  - [ ] Error si descuento > 0 sin motivo
  - [ ] Error si motivo < 10 caracteres
  - [ ] Mensaje: "El motivo debe tener al menos 10 caracteres"
  - [ ] No error si descuento = 0 sin motivo

- [ ] **3.4 Validación de Escritura**
  - [ ] Error si valor_escritura_publica <= 0
  - [ ] Mensaje: "El valor debe ser mayor a 0"
  - [ ] Permite NULL (opcional)

#### Backend (Triggers)

- [ ] **3.5 Trigger Motivo Ejecuta**
  - [ ] Bloquea INSERT con descuento > 0 sin motivo
  - [ ] Bloquea UPDATE que agrega descuento sin motivo
  - [ ] Mensaje: "motivo_descuento debe tener al menos 10 caracteres"

- [ ] **3.6 Trigger Porcentaje Ejecuta**
  - [ ] Calcula porcentaje al INSERT
  - [ ] Recalcula porcentaje al UPDATE de descuento
  - [ ] Setea porcentaje = 0 si descuento = 0

---

### Fase 4: Testing de Integración

#### Flujo Completo

- [ ] **4.1 Caso: Asignación Sin Descuento**
  1. Seleccionar proyecto y vivienda
  2. Verificar valores base cargados
  3. NO marcar checkbox descuento
  4. Ingresar valor minuta: $128.000.000
  5. Verificar alerta diferencia +$6M
  6. Continuar a Paso 2
  7. Guardar negociación
  8. Verificar en BD:
     - [ ] descuento_aplicado = 0
     - [ ] tipo_descuento = NULL
     - [ ] motivo_descuento = NULL
     - [ ] porcentaje_descuento = 0
     - [ ] valor_escritura_publica = 128000000

- [ ] **4.2 Caso: Descuento Trabajador Empresa**
  1. Seleccionar proyecto y vivienda (Base $117M + Gastos $5M = $122M)
  2. Marcar checkbox "¿Aplicar descuento?"
  3. Ingresar monto: $14.000.000
  4. Seleccionar tipo: "Trabajador de la Empresa"
  5. Ingresar motivo: "Trabajador con 5 años de antigüedad en la empresa"
  6. Verificar badge: 11.48%
  7. Verificar resumen visual:
     - [ ] Original: $122.000.000
     - [ ] Descuento: -$14.000.000
     - [ ] Final: $108.000.000
  8. Ingresar valor minuta: $128.000.000
  9. Verificar alerta diferencia +$20M
  10. Continuar a Paso 2 (fuentes sobre $108M)
  11. Guardar negociación
  12. Verificar en BD:
      - [ ] descuento_aplicado = 14000000
      - [ ] tipo_descuento = 'trabajador_empresa'
      - [ ] motivo_descuento = 'Trabajador con...'
      - [ ] porcentaje_descuento = 11.48
      - [ ] valor_escritura_publica = 128000000
      - [ ] valor_negociado = 108000000

- [ ] **4.3 Caso: Cliente VIP**
  1. Seleccionar vivienda
  2. Aplicar descuento $7M
  3. Tipo: Cliente VIP
  4. Motivo: "Cliente con historial de compras previas"
  5. Verificar cálculos correctos
  6. Guardar y verificar en BD

- [ ] **4.4 Caso: Validación Falla (Frontend)**
  1. Marcar checkbox descuento
  2. Ingresar monto: $14.000.000
  3. NO seleccionar tipo
  4. NO ingresar motivo
  5. Intentar continuar a Paso 2
  6. Verificar errores se muestran:
     - [ ] "Debes seleccionar un tipo de descuento"
     - [ ] "El motivo debe tener al menos 10 caracteres"
  7. No permite avanzar hasta corregir

- [ ] **4.5 Caso: Validación Falla (Backend)**
  1. Intentar INSERT directo en BD con descuento sin motivo
     ```sql
     INSERT INTO negociaciones (
       cliente_id, vivienda_id, valor_negociado, descuento_aplicado
     ) VALUES (..., ..., 108000000, 14000000);
     ```
  2. Verificar error de trigger

---

### Fase 5: Testing Responsive

#### Móvil (< 768px)

- [ ] **5.1 Layout Móvil**
  - [ ] Grid de valores base cambia a 1 columna
  - [ ] Checkbox y label se ajustan bien
  - [ ] Campos de descuento en 1 columna
  - [ ] Resumen visual se ve completo sin scroll horizontal
  - [ ] Alert diferencia notarial no se trunca
  - [ ] Resumen final legible

- [ ] **5.2 Inputs Táctiles**
  - [ ] Inputs tienen altura suficiente (min 44px)
  - [ ] Checkbox es clickeable fácilmente
  - [ ] Select muestra opciones correctamente
  - [ ] Textarea permite scroll vertical

#### Tablet (768px - 1024px)

- [ ] **5.3 Layout Tablet**
  - [ ] Grid de valores base en 2 columnas
  - [ ] Campos de descuento en 2 columnas (monto + tipo)
  - [ ] Todo visible sin zoom

#### Desktop (> 1024px)

- [ ] **5.4 Layout Desktop**
  - [ ] Grid de 2 columnas funciona correctamente
  - [ ] Espaciado adecuado
  - [ ] No hay elementos desalineados

---

### Fase 6: Testing Dark Mode

- [ ] **6.1 Valores Base**
  - [ ] Fondo: `dark:from-gray-950/30`
  - [ ] Texto: `dark:text-white`
  - [ ] Bordes: `dark:border-gray-700/50`

- [ ] **6.2 Sección Descuento**
  - [ ] Fondo: `dark:from-orange-950/30`
  - [ ] Texto: `dark:text-orange-300`
  - [ ] Bordes: `dark:border-orange-800/50`

- [ ] **6.3 Inputs**
  - [ ] Fondo: `dark:bg-gray-900/80`
  - [ ] Texto: `dark:text-white`
  - [ ] Placeholder: `dark:text-gray-500`
  - [ ] Border focus: `dark:border-orange-500`

- [ ] **6.4 Alerts**
  - [ ] Alert azul: `dark:bg-blue-950/30`, `dark:text-blue-300`
  - [ ] Alert amarillo: `dark:bg-yellow-950/30`, `dark:text-yellow-300`

- [ ] **6.5 Resumen Final**
  - [ ] Fondo: `dark:from-green-950/30`
  - [ ] Texto: `dark:text-green-300`
  - [ ] Bordes: `dark:border-green-800/50`

---

### Fase 7: Testing de Performance

- [ ] **7.1 Renders Innecesarios**
  - [ ] Componente no re-renderiza al escribir en inputs
  - [ ] Cálculos usan `useMemo` correctamente
  - [ ] No hay console.logs en producción

- [ ] **7.2 Animaciones**
  - [ ] Animación de expansión no causa lag
  - [ ] Animación corre a 60 FPS
  - [ ] No hay flash de contenido

- [ ] **7.3 Queries BD**
  - [ ] Índice `idx_clientes_tipo_numero_documento` reduce tiempo de validación duplicados a < 10ms
  - [ ] Índice `idx_negociaciones_descuento_aplicado` mejora queries de reportes
  - [ ] Vista `vista_descuentos_aplicados` responde en < 100ms con 1000 registros

---

### Fase 8: Testing de Accesibilidad

- [ ] **8.1 Semántica HTML**
  - [ ] Labels asociados a inputs con `htmlFor`
  - [ ] Textarea tiene label descriptivo
  - [ ] Checkbox tiene label claro

- [ ] **8.2 Navegación por Teclado**
  - [ ] Tab navega por todos los campos en orden lógico
  - [ ] Enter en checkbox lo marca/desmarca
  - [ ] Escape cierra componentes modales (si aplica)

- [ ] **8.3 Screen Readers**
  - [ ] Labels se leen correctamente
  - [ ] Errores de validación se anuncian
  - [ ] Mensajes de éxito se anuncian

- [ ] **8.4 Contraste de Colores**
  - [ ] Texto negro sobre fondo blanco: ratio >= 7:1
  - [ ] Texto blanco sobre fondo oscuro: ratio >= 7:1
  - [ ] Íconos tienen contraste suficiente

---

### Fase 9: Testing de Reportes

- [ ] **9.1 Vista de Descuentos**
  ```sql
  SELECT * FROM vista_descuentos_aplicados;
  ```
  - [ ] Retorna solo negociaciones con descuento > 0
  - [ ] Muestra nombre completo del cliente
  - [ ] Muestra número de vivienda y proyecto
  - [ ] Calcula `valor_original` correctamente
  - [ ] Calcula `diferencia_notarial` correctamente

- [ ] **9.2 Reportes por Tipo**
  ```sql
  SELECT
    tipo_descuento,
    COUNT(*) AS cantidad,
    SUM(descuento_aplicado) AS total_descuentos,
    AVG(porcentaje_descuento) AS promedio_porcentaje
  FROM vista_descuentos_aplicados
  GROUP BY tipo_descuento;
  ```
  - [ ] Agrupa por tipo correctamente
  - [ ] Suma total de descuentos correcta
  - [ ] Promedio de porcentaje correcto

---

## ✅ Criterios de Aprobación

### Para Pasar a Producción:

- [ ] **Todos los tests de Fase 1-3 pasan** (Unitario, Frontend, Validaciones)
- [ ] **Al menos 2 flujos completos de Fase 4 funcionan** (Sin descuento + Con descuento)
- [ ] **Responsive funciona en móvil, tablet, desktop** (Fase 5)
- [ ] **Dark mode completo sin errores visuales** (Fase 6)
- [ ] **Performance aceptable** (< 100ms para cálculos, < 10ms para índices)
- [ ] **Accesibilidad básica cumplida** (Fase 8)
- [ ] **0 errores TypeScript**
- [ ] **0 warnings en consola**

### Opcional (Post-MVP):

- [ ] Testing de accesibilidad completo con herramientas (axe, WAVE)
- [ ] Testing de performance con Chrome DevTools (Lighthouse)
- [ ] Testing de carga (100+ negociaciones con descuento)
- [ ] Testing de reportes PDF con descuentos

---

## 📝 Registro de Bugs

| # | Descripción | Severidad | Status | Fecha |
|---|-------------|-----------|--------|-------|
| - | - | - | - | - |

**Severidades:**
- 🔴 **Crítico**: Bloquea funcionalidad principal
- 🟠 **Alto**: Afecta experiencia de usuario
- 🟡 **Medio**: Mejora visual o de UX
- 🟢 **Bajo**: Nice-to-have

---

## 🚀 Checklist Pre-Deploy

- [ ] Todos los tests críticos pasan
- [ ] Migración SQL ejecutada en staging
- [ ] Tipos TypeScript sincronizados
- [ ] 0 errores de compilación
- [ ] Dark mode validado
- [ ] Responsive validado
- [ ] Documentación completa
- [ ] Backup de BD antes de deploy
- [ ] Rollback plan definido

---

**Creado**: 2025-12-05
**Actualizado**: -
**Responsable**: Equipo de Desarrollo
**Próxima Revisión**: Después de testing en desarrollo
