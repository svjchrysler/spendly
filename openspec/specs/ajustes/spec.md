# ajustes Specification

## Purpose
Estructura de la pantalla raíz de Ajustes: qué secciones muestra y en qué orden.

## Requirements
### Requirement: Ajustes ordenado por uso
La pantalla raíz de Ajustes SHALL abrir con el presupuesto del mes y, en orden, Categorías, Apariencia, Datos y Cuenta. MUST NOT mostrar un encabezado de perfil con avatar.

#### Scenario: Presupuesto definido
- **WHEN** el usuario abre Ajustes y el mes tiene presupuesto
- **THEN** la primera sección muestra el monto del presupuesto, cuánto se lleva gastado y una barra de avance, y al tocarla abre la pantalla de presupuesto

#### Scenario: Sin presupuesto
- **WHEN** el mes no tiene presupuesto
- **THEN** la primera sección invita a definirlo y al tocarla abre la pantalla de presupuesto

#### Scenario: Cuenta al final
- **WHEN** el usuario llega al final de Ajustes
- **THEN** ve el correo de la cuenta y la acción "Cerrar sesión" en la misma sección

### Requirement: Vista previa de categorías
La fila Categorías SHALL mostrar la cantidad de categorías y una vista previa de sus íconos.

#### Scenario: Con categorías
- **WHEN** el usuario tiene categorías
- **THEN** la fila muestra hasta cuatro íconos de categoría y el total

