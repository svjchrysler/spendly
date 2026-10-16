## ADDED Requirements

### Requirement: El vidrio desenfoca lo que tiene detrás
El material de la capa de navegación (tab bar, botones de vidrio y degradé de la barra superior) SHALL desenfocar el contenido que pasa por debajo en WebKit y en Chromium. Ningún ancestro de un elemento con `backdrop-filter` MUST convertirse en *backdrop root* fuera de una transición en curso.

#### Scenario: Contenido bajo la tab bar en Chrome
- **WHEN** en Chrome (navegador o PWA de Android) el usuario scrollea y una fila pasa por debajo de la tab bar
- **THEN** el texto de la fila se ve desenfocado a través del vidrio y no compite con los rótulos de los tabs

#### Scenario: Degradé de la barra al scrollear
- **WHEN** el large title colapsa y el contenido pasa por debajo del título inline
- **THEN** el degradé de la barra difumina ese contenido en lugar de solo atenuarlo

#### Scenario: Menos transparencia
- **WHEN** el sistema pide reducir la transparencia
- **THEN** el vidrio usa su tinte opaco de respaldo, sin desenfoque

### Requirement: El chrome queda quieto al cambiar de tab
Durante la transición entre tabs la barra superior, la tab bar y el sidebar SHALL quedar fijos mientras el contenido cambia por debajo. Fuera de esa transición no MUST llevar nombre de view transition.

#### Scenario: Cambio de tab
- **WHEN** el usuario pasa de Resumen a Gastos con las animaciones habilitadas
- **THEN** solo el contenido se funde y se asienta, y la píldora de la tab bar viaja al tab nuevo sin dejar un fantasma en el anterior

#### Scenario: Cambio de tema
- **WHEN** el usuario cambia entre claro y oscuro
- **THEN** toda la pantalla, chrome incluido, cambia con el mismo fundido
