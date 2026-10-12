## 1. Lógica pura

- [x] 1.1 `src/lib/frequent-expenses.ts`: `frequentExpenses(history, categories, limit)` + test
- [x] 1.2 `src/lib/month-readings.ts`: `buildMonthReadings(report, breakdown)` + test

## 2. Alta de gasto

- [x] 2.1 `ExpenseDatePicker`: píldora + popover con Hoy / Ayer / calendario, abre hacia abajo
- [x] 2.2 `ExpenseForm`: fecha junto al monto, fila de frecuentes en el alta, sin fila de fecha
- [x] 2.3 `ExpenseFormSkeleton` alineado con la estructura nueva
- [x] 2.4 Medir que el alta entra sobre el teclado (430 px, 371 px de teclado)

## 3. Gastos

- [x] 3.1 `ExpenseList`: prop `groupBy` con grupos por categoría y subtotal
- [x] 3.2 `ExpensesPage`: control Día / Categoría persistido en la sesión + skeleton

## 4. Análisis

- [x] 4.1 Bloque "Lo que dice el mes" al inicio de "Este mes"
- [x] 4.2 Reordenar el panel y reducir la grilla de métricas + skeleton

## 5. Ajustes

- [x] 5.1 `RootPanel`: presupuesto con avance primero, categorías con vista previa, cuenta al final

## 6. Cierre

- [x] 6.1 Actualizar `AGENTS.md`
- [x] 6.2 `pnpm lint`, `pnpm test`, `pnpm build` en verde
- [x] 6.3 Revisión visual en navegador (claro/oscuro, compact/regular)
