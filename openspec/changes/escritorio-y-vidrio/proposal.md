## Why

Spendly está muy afinada como PWA de iPhone, pero en escritorio (navegador o PWA instalada en Chrome) es la app del teléfono estirada: las interacciones pensadas para el dedo no se traducen al mouse y al teclado. Revisada en vivo con datos reales aparecen fallas concretas. En Chromium el Liquid Glass no desenfoca. Abrir cualquier modal achica la ventana entera. Las categorías del alta quedan en un riel horizontal que con rueda de mouse no se puede recorrer. Cada fila lleva dos íconos fijos y no se puede tocar. No hay atajos de teclado. Y en dos columnas, Resumen deja media pantalla vacía mientras Análisis esconde "Mayores gastos".

## What Changes

- **Vidrio que desenfoca en Chromium.** `.nav-bar`, `.tab-dock` y `.app-sidebar` llevan `view-transition-name` siempre, y en Chrome eso los vuelve *backdrop root*. Por eso el `backdrop-filter` de la tab bar, de los botones de vidrio y del degradé de la barra no ve nada detrás. Los nombres pasan a aplicarse solo durante la transición de tab.
- **Modal sin retroceso en ancho regular.** La pantalla que retrocede en Z queda para compact, donde imita la tarjeta de iOS. En regular el form sheet centrado ya no despega el sidebar de los bordes de la ventana.
- **Sidebar como centro de mando.** En ancho regular el sidebar lleva el botón "Nuevo gasto" con su atajo y, al pie, la cuenta, que abre Ajustes. La barra superior deja de mostrar `+` y avatar en regular, porque los dos viven en el sidebar. En compact no cambia nada.
- **Atajos de teclado.** `N` abre Nuevo gasto. `/` va a Gastos y enfoca la búsqueda. `←` y `→` cambian de mes. No se disparan al escribir en un campo, con un modal abierto ni con modificadores (⌘, Ctrl, Alt), y se anuncian en tooltips y en el botón del sidebar.
- **Filas para puntero fino.** Con mouse, la fila entera de un gasto abre la edición. "Eliminar" aparece al pasar el mouse o con foco de teclado, en lugar de dos íconos fijos en cada fila. En pantallas táctiles siguen el swipe y el action sheet.
- **Rieles alcanzables con mouse.** Con puntero fino, los rieles de chips (categorías y frecuentes del alta, filtros de Gastos) envuelven en varias líneas en vez de scrollear en horizontal con la barra oculta.
- **Columnas balanceadas.** En dos columnas, Resumen lleva la portada a la izquierda y "Por categoría" sobre "Recientes" a la derecha. En Análisis la columna derecha deja de ser sticky, porque es más alta que la ventana y escondía su final.

## Capabilities

### New Capabilities

- `material-vidrio`: el material Liquid Glass de la capa de navegación desenfoca lo que tiene detrás en todos los motores, y el chrome sigue quieto durante el cambio de tab.
- `uso-escritorio`: la app en ancho regular con teclado y puntero fino. Cubre las acciones del sidebar, los atajos de teclado, los rieles con mouse, la presentación modal sin retroceso y la distribución en dos columnas.

### Modified Capabilities

- `listado-gastos`: se agrega cómo se actúa sobre una fila con puntero fino (la fila edita y eliminar aparece al pasar el mouse o con foco).

## Impact

- Código: `index.css`, `AppShell`, `Sidebar`, `MonthPicker`, `ExpenseList`, `ExpenseFilters`, `ExpensesPage`, `DashboardPage`, `AnalisisPage` y `skeletons.tsx`.
- Lógica nueva, pura y con test: `src/lib/keyboard-shortcuts.ts`. Hook nuevo: `src/hooks/useKeyboardShortcuts.ts`.
- Datos: sin cambios de schema, de queries ni de query keys. No hay que subir el `buster`.
- Dependencias: ninguna nueva. Los tooltips usan el atributo `title`, sin librería.
- Compact táctil (iPhone, Duo cerrado): sin cambios de comportamiento. El único cambio visible es que el vidrio desenfoca en Chromium (PWA de Android).
- Docs: `AGENTS.md` (navegación, motion de modal, pitfalls).
