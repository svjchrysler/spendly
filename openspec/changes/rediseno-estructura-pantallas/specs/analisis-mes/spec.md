## ADDED Requirements

### Requirement: Lecturas del mes en lenguaje llano
El panel "Este mes" de Análisis SHALL abrir con una lista de lecturas: frases cortas derivadas del reporte del mes que interpretan los datos en lugar de enumerarlos. Cada lectura MUST basarse en un dato del mes y MUST omitirse cuando ese dato no existe o no es significativo.

#### Scenario: Mes con movimientos
- **WHEN** el mes tiene gastos
- **THEN** se muestran entre una y cinco lecturas, entre ellas el gasto típico (mediana) y, si existen, el día de la semana más caro, el peso del fin de semana, el mayor gasto y la concentración en la categoría principal

#### Scenario: Mes sin movimientos
- **WHEN** el mes no tiene gastos
- **THEN** no se muestra el bloque de lecturas y el panel indica que no hay movimientos para medir

#### Scenario: Un solo gasto
- **WHEN** el mes tiene un único gasto
- **THEN** no se muestran lecturas que comparen (gasto típico frente a promedio, día más caro)

### Requirement: Orden del panel "Este mes"
El panel SHALL ordenarse de la interpretación al detalle: lecturas, gráfico de ritmo, métricas y luego los gráficos por semana y por día de la semana. La grilla de métricas MUST NOT repetir cifras que ya dice una lectura.

#### Scenario: Primer pantallazo
- **WHEN** el usuario abre Análisis en un teléfono
- **THEN** lo primero que ve bajo el control de panel son las lecturas, no una grilla de cifras
