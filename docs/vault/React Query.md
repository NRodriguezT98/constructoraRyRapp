# ⚡ React Query

> Cache, sincronización y manejo de estado del servidor

---

## Relaciones

- Parte de → [[Stack Tecnológico]]
- Usado por → Todos los módulos de [[RyR Constructora]]
- Se conecta a → [[Base de Datos]] via services
- Configurado en → `src/lib/react-query.tsx`

---

## Patrón de Uso

```
Componente → Hook (useQuery/useMutation) → Service → Supabase
```

### Queries (lectura)
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['modulo', id],
  queryFn: () => moduloService.obtener(id)
})
```

### Mutations (escritura)
```typescript
const mutation = useMutation({
  mutationFn: (datos) => moduloService.crear(datos),
  onSuccess: () => queryClient.invalidateQueries(['modulo'])
})
```

---

## Módulos que lo usan

Todos: [[Proyectos]], [[Viviendas]], [[Clientes]], [[Negociaciones]], [[Fuentes de Pago]], [[Abonos]], [[Documentos]], [[Auditorías]], [[Usuarios]], [[Configuración]]

#infraestructura #estado
