"""
Script para generar DATABASE-SCHEMA-REFERENCE.md actualizado
desde el esquema real de Supabase
"""

import subprocess
import re
import os
from datetime import datetime

# Configuración de la base de datos (NUNCA hardcodear credenciales)
DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL:
    raise EnvironmentError(
        "La variable de entorno DATABASE_URL no está definida.\n"
        "Ejemplo: set DATABASE_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres"
    )

def ejecutar_query(query):
    """Ejecuta una query y retorna el resultado"""
    try:
        result = subprocess.run(
            ['psql', DB_URL, '-t', '-A', '-c', query],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error ejecutando query: {e}")
        return None

def obtener_tablas():
    """Obtiene lista de todas las tablas"""
    query = """
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE '%_backup_%'
    ORDER BY tablename;
    """
    resultado = ejecutar_query(query)
    if resultado:
        return [t for t in resultado.split('\n') if t.strip()]
    return []

def obtener_columnas(tabla):
    """Obtiene las columnas de una tabla"""
    query = f"""
    SELECT
        column_name || '|' ||
        data_type || '|' ||
        COALESCE(character_maximum_length::text, '') || '|' ||
        is_nullable || '|' ||
        COALESCE(column_default, '')
    FROM information_schema.columns
    WHERE table_name = '{tabla}'
    AND table_schema = 'public'
    ORDER BY ordinal_position;
    """
    resultado = ejecutar_query(query)
    if resultado:
        columnas = []
        for linea in resultado.split('\n'):
            if linea.strip():
                partes = linea.split('|')
                if len(partes) == 5:
                    columnas.append({
                        'nombre': partes[0],
                        'tipo': partes[1],
                        'longitud': partes[2],
                        'nullable': partes[3],
                        'default': partes[4]
                    })
        return columnas
    return []

def obtener_constraints(tabla):
    """Obtiene los constraints de una tabla"""
    query = f"""
    SELECT DISTINCT
        constraint_type || '|' || constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = '{tabla}'
    AND table_schema = 'public'
    ORDER BY constraint_type, constraint_name;
    """
    resultado = ejecutar_query(query)
    if resultado:
        constraints = []
        for linea in resultado.split('\n'):
            if linea.strip() and '|' in linea:
                tipo, nombre = linea.split('|', 1)
                constraints.append({'tipo': tipo, 'nombre': nombre})
        return constraints
    return []

def generar_markdown():
    """Genera el documento Markdown completo"""

    print("🔍 Extrayendo esquema de Supabase...")

    tablas = obtener_tablas()
    print(f"✅ Encontradas {len(tablas)} tablas")

    # Encabezado del documento
    markdown = f"""# 📚 DATABASE SCHEMA REFERENCE - RyR Constructora

**Última actualización**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Proyecto**: swyjhwgvkfcfdtemkyad
**Total de tablas**: {len(tablas)}

---

## 📋 Índice

"""

    # Generar índice
    for i, tabla in enumerate(tablas, 1):
        markdown += f"{i}. [{tabla}](#{tabla})\n"

    markdown += "\n---\n\n"

    # Generar documentación de cada tabla
    for i, tabla in enumerate(tablas, 1):
        print(f"📝 Procesando tabla {i}/{len(tablas)}: {tabla}")

        markdown += f"## {i}. Tabla: `{tabla}`\n\n"
        markdown += f"**Descripción**: Tabla para gestión de {tabla}\n\n"

        # Columnas
        columnas = obtener_columnas(tabla)
        if columnas:
            markdown += "### Columnas\n\n"
            markdown += "| Columna | Tipo | Nullable | Default | Descripción |\n"
            markdown += "|---------|------|----------|---------|-------------|\n"

            for col in columnas:
                tipo = col['tipo']
                if col['longitud']:
                    tipo += f"({col['longitud']})"

                default = col['default'] if col['default'] else '-'
                if len(default) > 50:
                    default = default[:47] + '...'

                markdown += f"| `{col['nombre']}` | {tipo} | {col['nullable']} | {default} |  |\n"

            markdown += "\n"

        # Constraints
        constraints = obtener_constraints(tabla)
        if constraints:
            markdown += "### Constraints\n\n"
            for const in constraints:
                markdown += f"- **{const['tipo']}**: `{const['nombre']}`\n"
            markdown += "\n"

        markdown += "---\n\n"

    # Guardar el archivo
    output_file = "docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown)

    print(f"\n✅ Documento generado: {output_file}")
    print(f"📊 Total de tablas documentadas: {len(tablas)}")

if __name__ == "__main__":
    generar_markdown()
