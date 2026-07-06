import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const CATEGORY_DEFAULTS = {
  alimentación: { icon: 'utensils', color: '#F59E0B' },
  comida: { icon: 'utensils', color: '#F59E0B' },
  food: { icon: 'utensils', color: '#F59E0B' },
  'eating out': { icon: 'utensils', color: '#F59E0B' },
  restaurante: { icon: 'utensils', color: '#F59E0B' },
  supermercado: { icon: 'utensils', color: '#F59E0B' },
  groceries: { icon: 'utensils', color: '#F59E0B' },
  transporte: { icon: 'car', color: '#3B82F6' },
  transport: { icon: 'car', color: '#3B82F6' },
  vivienda: { icon: 'home', color: '#8B5CF6' },
  home: { icon: 'home', color: '#8B5CF6' },
  rent: { icon: 'home', color: '#8B5CF6' },
  entretenimiento: { icon: 'gamepad-2', color: '#EC4899' },
  entertainment: { icon: 'gamepad-2', color: '#EC4899' },
  salud: { icon: 'heart-pulse', color: '#059669' },
  health: { icon: 'heart-pulse', color: '#059669' },
  suscripciones: { icon: 'receipt', color: '#06B6D4' },
  subscriptions: { icon: 'receipt', color: '#06B6D4' },
  taxi: { icon: 'car', color: '#3B82F6' },
  telefono: { icon: 'receipt', color: '#06B6D4' },
  teléfono: { icon: 'receipt', color: '#06B6D4' },
  university: { icon: 'receipt', color: '#8B5CF6' },
  universidad: { icon: 'receipt', color: '#8B5CF6' },
  otros: { icon: 'receipt', color: '#64748B' },
  other: { icon: 'receipt', color: '#64748B' },
}

const FALLBACK_COLORS = [
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#059669',
  '#64748B',
  '#EF4444',
  '#06B6D4',
]

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return env
}

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    const next = content[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((cell) => cell.length > 0)) rows.push(row)
  }

  return rows
}

function parseDate(value, timezone) {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d+$/.test(trimmed)) {
    const ms = trimmed.length <= 10 ? Number(trimmed) * 1000 : Number(trimmed)
    const date = new Date(ms)
    if (!Number.isNaN(date.getTime())) return formatDateInZone(date, timezone)
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) return formatDateInZone(parsed, timezone)

  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return isoMatch[1]

  return null
}

function formatDateInZone(date, timezone) {
  if (timezone) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }
  return toDateString(date)
}

function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeCategoryName(name) {
  return name.trim().replace(/\s+/g, ' ')
}

function categoryMeta(name) {
  const key = normalizeCategoryName(name).toLowerCase()
  if (CATEGORY_DEFAULTS[key]) return CATEGORY_DEFAULTS[key]

  let hash = 0
  for (const char of key) hash = (hash + char.charCodeAt(0)) % FALLBACK_COLORS.length
  return { icon: 'receipt', color: FALLBACK_COLORS[hash] }
}

function buildDescription(purpose, emoji, tags) {
  const parts = []
  const base = purpose?.trim()
  if (base) parts.push(base)
  if (emoji?.trim() && !base?.includes(emoji.trim())) parts.push(emoji.trim())
  if (tags?.trim()) parts.push(`#${tags.trim().replace(/,/g, ' #')}`)
  return parts.join(' ').trim() || null
}

async function main() {
  const csvPath = resolve(process.argv[2] ?? '/Users/js/Downloads/MonAi-List-1783299741.csv')
  const root = resolve(import.meta.dirname, '..')
  const env = {
    ...loadEnvFile(resolve(root, '.env.local')),
    ...loadEnvFile(resolve(root, '.owner-credentials.local')),
    ...process.env,
  }

  const supabaseUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ??
    env.VITE_SUPABASE_ANON_KEY ??
    env.SUPABASE_ANON_KEY
  const ownerEmail = env.VITE_OWNER_EMAIL ?? env.OWNER_EMAIL
  const ownerPass = env.OWNER_PASS ?? env.OWNER_PASSWORD

  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan VITE_SUPABASE_URL y clave de Supabase en .env.local')
    process.exit(1)
  }

  if (!existsSync(csvPath)) {
    console.error(`No se encontró el archivo: ${csvPath}`)
    process.exit(1)
  }

  const parsed = parseCsv(readFileSync(csvPath, 'utf8'))
  if (parsed.length === 0) {
    console.error('El CSV está vacío.')
    process.exit(1)
  }

  const [header, ...dataRows] = parsed
  const columns = header.map((col) => col.trim().toLowerCase())

  const required = ['date', 'amount', 'category']
  for (const col of required) {
    if (!columns.includes(col)) {
      console.error(`Columna requerida ausente en CSV: ${col}`)
      process.exit(1)
    }
  }

  if (dataRows.length === 0) {
    console.error('El CSV solo tiene encabezados, no hay gastos para importar.')
    console.error('Exporta de nuevo desde MonAi: Ajustes → Exportar CSV.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    if (!ownerEmail || !ownerPass) {
      console.error('Necesitas OWNER_PASS en .owner-credentials.local o SUPABASE_SERVICE_ROLE_KEY')
      process.exit(1)
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: ownerEmail,
      password: ownerPass,
    })
    if (signInError) {
      console.error('Error al iniciar sesión:', signInError.message)
      process.exit(1)
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('No se pudo obtener el usuario autenticado.')
    process.exit(1)
  }

  const { data: existingCategories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', user.id)

  if (categoriesError) {
    console.error('Error leyendo categorías:', categoriesError.message)
    process.exit(1)
  }

  const categoryByName = new Map(
    (existingCategories ?? []).map((category) => [
      normalizeCategoryName(category.name).toLowerCase(),
      category.id,
    ]),
  )

  const expenses = []
  const skipped = []

  for (const [index, cells] of dataRows.entries()) {
    const row = Object.fromEntries(columns.map((col, i) => [col, cells[i]?.trim() ?? '']))
    const amount = Math.abs(Number.parseFloat(row.amount))
    const expenseDate = parseDate(row.date, row.timezone)
    const categoryName = normalizeCategoryName(row.category || 'Otros')

    if (!expenseDate || Number.isNaN(amount) || amount <= 0) {
      skipped.push({ line: index + 2, reason: 'fecha o monto inválido', row })
      continue
    }

    expenses.push({
      line: index + 2,
      external_id: row.id ? `monai:${row.id}` : null,
      categoryName,
      amount,
      expense_date: expenseDate,
      description: buildDescription(row.purpose, row.emoji, row.tags),
    })
  }

  if (expenses.length === 0) {
    console.error('Ninguna fila válida para importar.')
    if (skipped.length > 0) console.table(skipped.slice(0, 10))
    process.exit(1)
  }

  let createdCategories = 0
  for (const name of new Set(expenses.map((item) => item.categoryName))) {
    const key = name.toLowerCase()
    if (categoryByName.has(key)) continue

    const meta = categoryMeta(name)
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name,
        icon: meta.icon,
        color: meta.color,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Error creando categoría "${name}":`, error.message)
      process.exit(1)
    }

    categoryByName.set(key, data.id)
    createdCategories += 1
  }

  let inserted = 0
  let duplicates = 0
  let failed = 0

  for (const expense of expenses) {
    const categoryId = categoryByName.get(expense.categoryName.toLowerCase())
    if (!categoryId) {
      failed += 1
      continue
    }

    const payload = {
      user_id: user.id,
      category_id: categoryId,
      amount: expense.amount,
      description: expense.description,
      expense_date: expense.expense_date,
      external_id: expense.external_id,
    }

    const { error } = await supabase.from('expenses').insert(payload)
    if (!error) {
      inserted += 1
      continue
    }

    if (error.code === '23505' && expense.external_id) {
      duplicates += 1
      continue
    }

    failed += 1
    console.error(`Fila ${expense.line}:`, error.message)
  }

  console.log('\nImportación MonAi completada')
  console.log(`  Archivo: ${csvPath}`)
  console.log(`  Filas leídas: ${dataRows.length}`)
  console.log(`  Categorías nuevas: ${createdCategories}`)
  console.log(`  Gastos importados: ${inserted}`)
  console.log(`  Duplicados omitidos: ${duplicates}`)
  console.log(`  Filas inválidas: ${skipped.length}`)
  console.log(`  Errores: ${failed}`)

  if (skipped.length > 0) {
    console.log('\nPrimeras filas omitidas:')
    console.table(skipped.slice(0, 5))
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
