## 1. Vidrio y profundidad (CSS)

- [x] 1.1 `index.css`: `view-transition-name` de `.nav-bar`, `.tab-dock` y `.app-sidebar` solo bajo `:root[data-vt-dir]`
- [x] 1.2 `index.css`: reglas `html[data-modal]` solo en compact (`width < 768px`), sin el bloque de `transform-origin` del sidebar
- [ ] 1.3 Verificar en Chrome que la tab bar y la barra desenfocan, y que el chrome queda quieto al cambiar de tab

## 2. Atajos de teclado

- [x] 2.1 `src/lib/keyboard-shortcuts.ts`: `matchShortcut(evento, contexto)` + test
- [x] 2.2 `src/hooks/useKeyboardShortcuts.ts`: contexto desde el DOM (campo editable, control con flechas, modal abierto) y `keydown` en `window`
- [x] 2.3 `AppShell`: N → alta, `/` → `/gastos?buscar=1`, ←/→ → mes
- [x] 2.4 `ExpensesPage` + `ExpenseFilters`: enfocar la búsqueda con `?buscar=1` y limpiar el param; `kbd` "/" con puntero fino
- [x] 2.5 Tooltips (`title`) con el atajo en el `+` del dock y en los botones de mes

## 3. Sidebar como centro de mando

- [x] 3.1 `Sidebar`: botón "Nuevo gasto" con `kbd` N y cuenta al pie que abre Ajustes
- [x] 3.2 `AppShell`: sin `+` ni avatar en la barra en ancho regular

## 4. Filas y rieles con puntero fino

- [x] 4.1 `ExpenseList`: con puntero fino la fila edita y "Eliminar" es un hermano que aparece con hover o foco
- [x] 4.2 `index.css`: `.expense-row` (separador, botón eliminar), `:focus-visible` de filas tocables y `.filter-scroll` envolviendo con `pointer: fine`
- [x] 4.3 `ExpenseCategoryPicker`: chips de 36 px con `md:pointer-fine:`

## 5. Columnas

- [x] 5.1 `DashboardPage`: portada a la izquierda; Por categoría y Recientes a la derecha en `@4xl/main`, mismo orden en una columna
- [x] 5.2 `DashboardSkeleton` alineado con la grilla nueva
- [x] 5.3 `AnalisisPage`: columna derecha sin `sticky`

## 6. Cierre

- [x] 6.1 Actualizar `AGENTS.md` (navegación, modal, atajos, filas, pitfall del vidrio)
- [x] 6.2 `pnpm lint`, `pnpm test`, `pnpm build` en verde
- [ ] 6.3 Revisión en navegador: escritorio ancho, ventana angosta, claro/oscuro, teclado
