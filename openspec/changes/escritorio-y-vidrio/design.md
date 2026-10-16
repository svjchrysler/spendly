## Context

Spendly se diseñó para el iPhone instalado como PWA (compact, táctil). El ancho regular (iPhone Duo abierto, iPad, escritorio) recibe la misma app con un sidebar. La revisión en vivo, con Chrome de escritorio a 1728 px y a 500 px y datos reales, encontró que varias decisiones pensadas para el dedo se rompen con mouse y teclado, y que el vidrio no desenfoca en Chromium. Rigen las restricciones de `AGENTS.md`: diff mínimo, sin dependencias, copy en español, skeletons alineados, el alta entra sobre el teclado del iPhone, todo lo `fixed` va por portal y las entradas animan con `backwards`.

## Goals / Non-Goals

**Goals:**
- Que el vidrio se vea como vidrio en Chrome (escritorio y PWA de Android).
- Escritorio de primera: acciones a mano en el sidebar, atajos de teclado, filas y rieles que funcionan con mouse, modales que no achican la ventana y dos columnas sin huecos.
- Cero cambios de comportamiento en el iPhone.

**Non-Goals:**
- Cambios de datos, queries o query keys.
- Un sistema de tooltips o una paleta de comandos (⌘K). Alcanza con `title` y con el `kbd` del sidebar.
- `window-controls-overlay` para la PWA de escritorio: pide diseñar una barra de título arrastrable.
- Tocar la lógica del tope mensual o de los charts. Quedan como recomendaciones aparte.

## Decisions

**1. `view-transition-name` solo durante la transición de tab.** En Chromium, un elemento con `view-transition-name` es *backdrop root*: el `backdrop-filter` de cualquier descendiente solo ve lo que se pinta dentro de ese elemento. Por eso la tab bar, los botones de vidrio y el `::before` de la barra mostraban el contenido nítido. Verificado en vivo: con `view-transition-name: none` en `.tab-dock`, el vidrio desenfoca. `useRouteTransition` ya escribe `data-vt-dir` en `<html>` antes de `startViewTransition` y lo borra al terminar, así que los nombres del chrome pasan a `:root[data-vt-dir] …`. El snapshot viejo se toma después del recálculo de estilos, con los nombres ya puestos. El cambio de tema no escribe `data-vt-dir`: el chrome se funde junto con la página, que es lo coherente con un cambio de tema. Alternativa descartada: mover el nombre a un wrapper. Cualquier ancestro con nombre rompe igual.

**2. Profundidad de modal solo en compact.** Las reglas `html[data-modal] …` pasan a vivir dentro de `@media (width < 768px)` y se borra el bloque de `transform-origin` para el sidebar. `modal-depth.ts` sigue igual: el atributo es inofensivo en regular. Se hace en CSS y no en JS para que plegar el Duo con un modal abierto se resuelva solo. En iPadOS un form sheet atenúa el fondo pero no lo empuja, y en escritorio el sidebar despegado de los bordes se leía como una falla.

**3. El sidebar recibe las acciones del header en regular.** `Sidebar` suma un botón "Nuevo gasto" (relleno `primary`, no vidrio: el sidebar ya es la capa de vidrio y no va vidrio sobre vidrio) con `kbd` N solo con puntero fino. Al pie suma la cuenta (inicial y "Ajustes", con el correo debajo), que abre Ajustes. En `AppShell` el `+` de la barra desaparece (solo existía en regular) y el avatar pasa a `md:hidden`. En regular la barra queda con el título inline al scrollear.

**4. Atajos: matcher puro y hook delgado.** `lib/keyboard-shortcuts.ts` exporta `matchShortcut(evento, contexto)`, testeable sin DOM, que devuelve `'add' | 'search' | 'prev-month' | 'next-month' | null`. El hook `useKeyboardShortcuts` arma el contexto desde el DOM y escucha `keydown` en `window`. El contexto dice si el foco está en un campo editable, si está en un control que ya usa flechas (`radiogroup`, `tablist`, charts) y si hay un modal abierto (`[role=dialog]`, `[role=alertdialog]` o sheet montado). Se ignoran ⌘/Ctrl/Alt, `repeat` e IME. Shift no se filtra: `/` es Shift+7 en teclados en español.
   - Buscar reusa el patrón de query params de la app (`?nuevo=1`, `?ajustes=`): `/` navega a `/gastos?buscar=1` con la transición de tab, o solo pone el param si ya estás ahí. `ExpensesPage` enfoca la búsqueda (vía `ref` en `ExpenseFilters`) y borra el param con `replace`. Si las categorías siguen cargando, el efecto espera a que exista el input.
   - Se anuncian con `title` en el botón del sidebar, el `+` del dock y los botones de mes, más un `kbd` "/" en el campo de búsqueda vacío con puntero fino.

**5. Fila con puntero fino: la fila edita y eliminar aparece al pasar el mouse.** La fila pasa a ser el `<button>` de `ListRow` (`onPress` = editar). El botón de eliminar es un hermano absoluto dentro de un wrapper `.expense-row`, porque un botón dentro de otro es HTML inválido. Se ve con `:hover` o `:focus-within`, y la fila reserva su lugar para que la columna de montos no se mueva. El separador indentado suma `.expense-row + .expense-row .list-row::before`, igual que `.swipe-row`. Las filas tocables ganan un `:focus-visible` con outline interior, porque `.list-group` recorta con `overflow: hidden`. Alternativa descartada: hacer clicable un `div` con `onClick`, que deja el editar fuera del teclado.

**6. Rieles: envolver con `pointer: fine`.** `.filter-scroll` suma `@media (pointer: fine)` con `flex-wrap: wrap`, sin máscara y sin overflow horizontal. Se usa el puntero y no el ancho porque el problema es la rueda del mouse, que no scrollea en horizontal. Un iPad con trackpad sigue con `pointer: coarse` y su riel. Los chips de categoría del alta bajan a 36 px con `md:pointer-fine:`, la convención de densidad, para que el diálogo no crezca de más. El efecto que alinea el chip activo ya no hace nada cuando el riel no desborda.

**7. Dos columnas: ubicación por grid, no por DOM.** En Resumen el DOM sigue en el orden de una columna (portada, Recientes, Por categoría). En `@4xl/main` la portada ocupa dos filas a la izquierda y las secciones se ubican con `col-start-2`/`row-start-*`, con `grid-rows-[auto_1fr]` para que el sobrante quede bajo Recientes. `DashboardSkeleton` copia la misma grilla. En Análisis se quita el `sticky` de la columna derecha: un sticky más alto que la ventana deja su final inalcanzable hasta el pie de la página. Gastos conserva su riel sticky, que es corto.

## Risks / Trade-offs

- [El cambio de tab arranca sin los nombres aplicados y el chrome viaja con la página] → `data-vt-dir` se escribe antes de `startViewTransition`, y el snapshot viejo se captura en el siguiente frame, con estilos recalculados. Hay que verificarlo en el navegador cambiando de tab.
- [Durante la transición de tab (≈320 ms) el vidrio vuelve a no desenfocar] → es el estado que hoy se ve siempre, ahora reducido a un instante en que el contenido se está fundiendo.
- [Desenfoque real en la barra = más trabajo de GPU al scrollear en Chrome] → la barra ya usa `blur(10px)`, reducido a propósito, y `prefers-reduced-transparency` lo apaga.
- [Un atajo de una letra choca con lectores de pantalla] → en modo exploración el lector se queda con la tecla antes que la página, y en modo foco sobre un campo el hook no actúa.
- [Eliminar por error al pasar el mouse] → el botón aparece recién bajo el cursor y el borrado ofrece "Deshacer".
- [Los rieles envueltos alargan el alta en una laptop baja] → chips de 36 px. El diálogo ya scrollea con la barra sticky, así que cerrar y confirmar siguen a mano.
- [Sin poder probar WebKit acá] → el cambio de nombres es neutro donde el motor no trata `view-transition-name` como backdrop root. Falta la prueba en un iPhone real.

## Open Questions

- ¿El aviso de tope mensual (Bs 20.000 fijo) debería ocultarse cuando el presupuesto del mes ya dice lo mismo? Hoy la portada lo cuenta tres veces. Queda fuera de este cambio.
