import type { Database } from './database.generated'

export type { Database, Json } from './database.generated'

export type Category = Database['public']['Tables']['categories']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type MonthlyBudget = Database['public']['Tables']['monthly_budgets']['Row']

export type ExpenseWithCategory = Expense & {
  category: Category | null
}
