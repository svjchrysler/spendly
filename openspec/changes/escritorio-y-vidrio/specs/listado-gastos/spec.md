## ADDED Requirements

### Requirement: Filas de gasto con puntero fino
Con puntero fino (mouse o trackpad), la fila entera de un gasto SHALL abrir su edición con un clic o con Enter cuando tiene el foco. La acción "Eliminar" de la fila SHALL aparecer al pasar el mouse sobre la fila o cuando la fila o el botón tienen foco de teclado, y MUST NOT mostrarse fija en cada fila. Con puntero táctil MUST seguir el swipe y el action sheet. Esto aplica al listado de Gastos y a Recientes de Resumen.

#### Scenario: Editar con un clic
- **WHEN** el usuario hace clic en cualquier parte de una fila de gasto con el mouse
- **THEN** se abre "Editar gasto" con los datos de esa fila

#### Scenario: Eliminar al pasar el mouse
- **WHEN** el usuario pasa el mouse sobre una fila y hace clic en el ícono de eliminar
- **THEN** el gasto se elimina, la edición no se abre y se ofrece "Deshacer"

#### Scenario: Navegación con teclado
- **WHEN** el usuario recorre el listado con Tab
- **THEN** cada fila recibe foco visible, Enter abre su edición y el siguiente Tab llega a su botón "Eliminar"

#### Scenario: Pantalla táctil
- **WHEN** el usuario toca una fila en un iPhone
- **THEN** se abre el action sheet con Editar y Eliminar, como antes
