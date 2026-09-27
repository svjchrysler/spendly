/*
  CSV pensado para abrirse con doble click en Excel en español: `;` como
  separador y coma decimal (con `,` Excel es-* mete todo en una columna), BOM
  para que respete los acentos. Google Sheets detecta ambos solo.
*/
type CsvRow = {
  expense_date: string
  amount: number
  description: string | null
  category: { name: string } | null
}

function cell(value: string) {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function expensesToCsv(rows: readonly CsvRow[]) {
  const lines = [
    ['Fecha', 'Monto', 'Categoría', 'Descripción'].join(';'),
    ...rows.map((row) =>
      [
        row.expense_date,
        Number(row.amount).toFixed(2).replace('.', ','),
        cell(row.category?.name ?? ''),
        cell(row.description ?? ''),
      ].join(';'),
    ),
  ]
  return `﻿${lines.join('\r\n')}\r\n`
}
