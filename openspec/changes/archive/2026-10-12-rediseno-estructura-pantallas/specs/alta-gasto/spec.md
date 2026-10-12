## ADDED Requirements

### Requirement: Gastos frecuentes en el alta
El formulario de alta de gasto SHALL mostrar una fila de gastos frecuentes derivada del historial del usuario: las descripciones más repetidas, sin distinguir mayúsculas ni acentos, cada una con la categoría que se le asignó más recientemente. La fila MUST ocultarse cuando no hay historial y MUST NOT aparecer al editar un gasto existente.

#### Scenario: Elegir un gasto frecuente
- **WHEN** el usuario toca un gasto frecuente en el alta
- **THEN** la descripción y la categoría del formulario toman las de ese gasto, la categoría queda marcada como elegida (no se vuelve a sugerir otra) y el monto no cambia

#### Scenario: Sin historial
- **WHEN** el usuario abre el alta y su historial no tiene descripciones
- **THEN** la fila de frecuentes no se muestra y el resto del formulario no cambia de posición respecto de tenerla vacía

#### Scenario: Categoría eliminada
- **WHEN** una descripción frecuente apunta a una categoría que ya no existe
- **THEN** esa descripción no aparece entre los frecuentes

### Requirement: Fecha compacta junto al monto
El formulario SHALL mostrar la fecha del gasto como una píldora junto al monto, con el rótulo "Hoy", "Ayer" o el día abreviado. Al tocarla SHALL abrir un selector con accesos "Hoy" y "Ayer" y un calendario mensual.

#### Scenario: Fecha por defecto
- **WHEN** el usuario abre el alta estando en el mes en curso
- **THEN** la píldora dice "Hoy" y no hace falta tocarla para guardar

#### Scenario: Elegir ayer
- **WHEN** el usuario abre el selector y toca "Ayer"
- **THEN** el selector se cierra y la píldora dice "Ayer"

#### Scenario: Elegir otro día
- **WHEN** el usuario toca un día en el calendario
- **THEN** el selector se cierra y la píldora muestra ese día abreviado

### Requirement: El alta entra sobre el teclado
Con el teclado numérico abierto en un iPhone de 430×932 pt, el formulario de alta SHALL verse completo, incluido "Guardar y agregar otro", sin scrollear.

#### Scenario: Teclado abierto
- **WHEN** el alta se abre con el foco en el monto en un viewport de 430 pt de ancho con 371 pt ocupados por el teclado
- **THEN** el alto del sheet no supera el espacio libre y su contenido no desborda
