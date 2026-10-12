## Context

Spendly es una PWA personal mobile-first (React 19, Tailwind v4, TanStack Query, Supabase). La identidad visual "libreta" ya está aplicada por tokens; este cambio es de estructura de pantallas. Restricciones que mandan (ver `AGENTS.md`): diff mínimo, sin dependencias nuevas, copy en español, lógica no trivial con test, skeleton alineado con la pantalla, y el alta de gasto tiene que entrar entera sobre el teclado numérico (medido: 486 px libres en un iPhone de 430×932).

## Goals / Non-Goals

**Goals:**
- Menos tipeo para el caso más común: repetir un gasto habitual de hoy.
- Dos lecturas del mismo listado (cuándo / en qué) sin salir de Gastos.
- Que Análisis diga algo antes de mostrar cifras.
- Ajustes ordenado por frecuencia de uso.

**Non-Goals:**
- Cambios de schema, queries o query keys.
- Tocar la portada de Resumen, la navegación (tab bar / sidebar) o la identidad visual.
- Sugerir montos: el historial que se baja no trae `amount` y agregarlo cambia la forma del cache persistido.

## Decisions

**1. Frecuentes desde `['expense-history']`, sin query nueva.** Ese historial (1500 filas, `description` + `category_id`, más reciente primero) ya se baja para predecir categoría. `frequentExpenses()` agrupa por descripción normalizada, cuenta, y toma la categoría de la aparición más reciente. Alternativa descartada: una vista/RPC en Supabase con frecuencia y último monto — más preciso, pero es schema + RLS + bump del `buster` para una fila de atajos.

**2. La fecha pasa a una píldora para pagar el alto de los frecuentes.** El form mide 460 px de 486 disponibles. La fila de fecha (44 + 14 de gap) sale y entra la de frecuentes (36 + 14): el alto neto baja. Costo aceptado: "Ayer" pasa de uno a dos toques; la fecha casi siempre es hoy y repetir un gasto es más frecuente que cargar uno atrasado. Alternativa descartada: mostrar frecuentes solo sin teclado — el alta abre con el teclado arriba, así que nunca se verían.

**3. El selector de fecha abre hacia abajo dentro del sheet.** La píldora está arriba del form, así que el popover pasa de `bottom-full` a `top-full`. Sigue siendo un popover propio (no `Dialog`): un modal dentro del sheet rompería el refcount de `modal-depth`.

**4. Agrupación como prop de `ExpenseList`.** `groupBy: 'day' | 'category'` cambia solo cómo se arma `grouped` y qué va en el encabezado y el caption; filas, swipe, action sheet y edición se reusan. El estado vive en `ExpensesPage` con `useSessionState`, igual que búsqueda y filtro.

**5. Lecturas como función pura.** `buildMonthReadings(report, breakdown)` devuelve `{ id, text }[]` y se testea sin UI. Cada lectura tiene su propia condición de significancia (p. ej. la mediana solo se compara con el promedio si difieren más de 25 %).

**6. Ajustes: mismo stack, otra raíz.** Solo cambia `RootPanel`; el stack de paneles, los ids de form y las entradas `?ajustes=` no se tocan.

## Risks / Trade-offs

- [Frecuentes sesgados por datos importados (CSV de otra app)] → se cuentan apariciones, no importes; un top de 6 tolera ruido. Si molesta, se puede ponderar por recencia sin cambiar la interfaz.
- [Dos toques para "Ayer"] → el selector abre con Hoy/Ayer arriba, a un pulgar de la píldora.
- [Popover de calendario más alto que el espacio sobre el teclado] → el sheet ya scrollea y su barra es sticky.
- [Agrupar por categoría con muchas secciones y `content-visibility`] → se reusa `DaySection`, que ya maneja ese caso.
- [No verificado en dispositivo] → se mide en navegador a 430 px simulando el teclado; falta la prueba en iPhone real.
