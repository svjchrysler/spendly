## ADDED Requirements

### Requirement: Agrupar el listado por día o por categoría
La pantalla Gastos SHALL ofrecer un control para agrupar el listado del mes por día (por defecto) o por categoría. Cada grupo SHALL mostrar su subtotal. La elección MUST conservarse al cambiar de tab y volver dentro de la misma sesión.

#### Scenario: Agrupar por categoría
- **WHEN** el usuario elige "Categoría"
- **THEN** los gastos se muestran en un grupo por categoría, ordenados de mayor a menor subtotal, con el nombre de la categoría y su subtotal en el encabezado y la fecha de cada gasto en la fila

#### Scenario: Volver a agrupar por día
- **WHEN** el usuario elige "Día"
- **THEN** el listado vuelve a los grupos por fecha, del más reciente al más antiguo, con la categoría en cada fila

#### Scenario: La agrupación respeta los filtros
- **WHEN** hay una búsqueda o un filtro de categoría activo
- **THEN** los grupos y subtotales se calculan solo sobre los gastos que pasan el filtro

#### Scenario: Persistencia en la sesión
- **WHEN** el usuario elige "Categoría", va a Resumen y vuelve a Gastos
- **THEN** el listado sigue agrupado por categoría

### Requirement: Las acciones sobre un gasto no dependen de la agrupación
Editar y eliminar un gasto (swipe, action sheet o botones) SHALL funcionar igual en ambos modos de agrupación.

#### Scenario: Eliminar agrupando por categoría
- **WHEN** el usuario elimina un gasto con el listado agrupado por categoría
- **THEN** la fila desaparece, el subtotal del grupo se actualiza y se ofrece "Deshacer"
