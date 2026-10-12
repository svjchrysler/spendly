## Why

El rediseño "libreta" cambió la identidad (color, tipografía, superficies) y la portada de Resumen, pero Gastos, Análisis, el alta de gasto y Ajustes conservan la estructura anterior: se ven distintos y se usan igual. Las cuatro pantallas tienen fricciones de estructura que un cambio de tokens no resuelve: cargar un gasto repetido obliga a tipear todo de nuevo, el listado solo se puede leer por día, Análisis abre con una pared de seis cifras que el usuario tiene que interpretar, y Ajustes dedica su mejor espacio a un avatar.

## What Changes

- **Alta de gasto**: fila de **gastos frecuentes** (descripciones más usadas del historial) que completan descripción y categoría con un toque. La fecha deja de ocupar una fila propia: pasa a una píldora junto al monto que abre Hoy / Ayer / calendario. **BREAKING** (UX): elegir "Ayer" pasa de un toque a dos.
- **Gastos**: el listado se puede agrupar **por día** (actual) o **por categoría**, con subtotal por grupo. La elección persiste durante la sesión.
- **Análisis**: el panel "Este mes" abre con **"Lo que dice el mes"**, una lista de lecturas en lenguaje llano derivadas del reporte (gasto típico, día más caro, peso del fin de semana, mayor gasto, concentración). La grilla de métricas se reduce a las cifras que las lecturas no cubren y baja debajo del gráfico de ritmo.
- **Ajustes**: la pantalla raíz se reordena por uso. Abre con el presupuesto del mes y su avance; siguen Categorías (con vista previa de sus íconos), Apariencia y Datos; la cuenta (correo + cerrar sesión) pasa al final y desaparece el encabezado con avatar.

## Capabilities

### New Capabilities

- `alta-gasto`: formulario de alta/edición de gasto — gastos frecuentes y selector de fecha compacto.
- `listado-gastos`: listado del mes en Gastos — modos de agrupación y subtotales.
- `analisis-mes`: lectura del mes en Análisis — lecturas en lenguaje llano y orden del panel.
- `ajustes`: estructura de la pantalla raíz de Ajustes.

### Modified Capabilities

Ninguna: `openspec/specs/` está vacío; este es el primer cambio especificado.

## Impact

- Código: `ExpenseForm`, `ExpenseDatePicker`, `ExpenseList`, `ExpensesPage`, `AnalisisPage`, `SettingsSheet`, `skeletons.tsx`, `index.css`.
- Lógica nueva y pura, con tests: `src/lib/frequent-expenses.ts`, `src/lib/month-readings.ts`.
- Datos: sin cambios de schema, de queries ni de query keys (los frecuentes salen de `['expense-history']`, que ya se baja). No hay que subir el `buster` del cache persistido.
- Dependencias: ninguna nueva.
- Docs: `AGENTS.md` (secciones de arquitectura y lenguaje visual).
