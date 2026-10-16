## ADDED Requirements

### Requirement: El sidebar concentra las acciones en ancho regular
En ancho regular (≥ 768 px) el sidebar SHALL mostrar, además de los tres destinos, un botón "Nuevo gasto" y, al pie, la cuenta del usuario, que abre Ajustes. La barra superior MUST NOT duplicar esas acciones en ancho regular. En ancho compact la barra superior y la tab bar MUST seguir como están.

#### Scenario: Agregar desde el sidebar
- **WHEN** el usuario hace clic en "Nuevo gasto" del sidebar
- **THEN** se abre el alta de gasto, igual que con el `+` de la tab bar en compact

#### Scenario: Abrir Ajustes desde el sidebar
- **WHEN** el usuario hace clic en la cuenta al pie del sidebar
- **THEN** se abre Ajustes en su pantalla raíz

#### Scenario: Barra superior en regular
- **WHEN** la ventana mide 768 px o más
- **THEN** la barra superior no muestra `+` ni avatar, y al scrollear sigue mostrando el título inline

### Requirement: Atajos de teclado globales
La app SHALL responder a los atajos `N` (nuevo gasto), `/` (buscar) y `←` / `→` (mes anterior / siguiente). Un atajo MUST NOT dispararse mientras el foco está en un campo editable, con un sheet o diálogo abierto, si la tecla viene con ⌘, Ctrl o Alt, o si se mantiene apretada. Las flechas MUST NOT dispararse cuando el foco está en un control que ya usa flechas (segmented control, tabs).

#### Scenario: Nuevo gasto con N
- **WHEN** el usuario aprieta `N` sin foco en un campo
- **THEN** se abre el alta de gasto con el foco en el monto

#### Scenario: Buscar desde otra pantalla
- **WHEN** el usuario aprieta `/` en Resumen
- **THEN** la app va a Gastos y deja el foco en el campo de búsqueda, sin escribir la barra

#### Scenario: Cambiar de mes con flechas
- **WHEN** el usuario aprieta `→` sin foco en un campo ni en un control con flechas
- **THEN** el mes avanza uno, igual que con el botón "Mes siguiente"

#### Scenario: Escribiendo
- **WHEN** el foco está en la búsqueda o en un campo del alta y el usuario escribe "n" o "/"
- **THEN** el carácter se escribe y no se dispara ningún atajo

#### Scenario: Atajo anunciado
- **WHEN** el usuario pasa el mouse sobre "Nuevo gasto" o sobre los botones de mes
- **THEN** un tooltip muestra la acción y su atajo

### Requirement: Rieles de chips alcanzables con mouse
Con puntero fino, los rieles de chips (categorías y frecuentes del alta, filtros por categoría de Gastos) SHALL mostrar todas sus opciones envolviendo en varias líneas, sin depender de un scroll horizontal. Con puntero táctil MUST seguir siendo un riel horizontal.

#### Scenario: Elegir categoría con mouse en el alta
- **WHEN** el usuario abre el alta en un escritorio con mouse y tiene más categorías de las que entran en una línea
- **THEN** todas las categorías se ven y se pueden elegir con un clic

#### Scenario: Riel en el teléfono
- **WHEN** el usuario abre el alta en un iPhone
- **THEN** las categorías siguen en un riel horizontal de una línea y el alta entra completa sobre el teclado

### Requirement: Presentación modal en ancho regular
En ancho regular, abrir un sheet o diálogo SHALL atenuar el fondo sin achicar ni desplazar la pantalla de atrás. El retroceso en profundidad MUST quedar limitado al ancho compact.

#### Scenario: Alta en escritorio
- **WHEN** el usuario abre Nuevo gasto en una ventana de 1280 px
- **THEN** el diálogo aparece centrado sobre el fondo atenuado y el sidebar sigue pegado a los bordes de la ventana

#### Scenario: Alta en el teléfono
- **WHEN** el usuario abre Nuevo gasto en un iPhone
- **THEN** la pantalla de atrás retrocede como una tarjeta, igual que antes

### Requirement: Columnas balanceadas en ancho de escritorio
Cuando el contenido mide 56 rem o más, Resumen SHALL mostrar la portada del mes en la columna izquierda y "Por categoría" sobre "Recientes" en la derecha. Análisis MUST NOT fijar su columna derecha al scrollear. En una columna, el orden de Resumen MUST seguir siendo portada, Recientes y Por categoría.

#### Scenario: Resumen en escritorio
- **WHEN** el usuario abre Resumen en una ventana ancha
- **THEN** "Recientes" aparece en la columna derecha, debajo de "Por categoría", sin un hueco vacío bajo esa columna

#### Scenario: Mayores gastos en Análisis
- **WHEN** el usuario scrollea Análisis en una ventana ancha
- **THEN** la columna derecha acompaña el scroll y "Mayores gastos" se puede ver sin llegar al final de la página
