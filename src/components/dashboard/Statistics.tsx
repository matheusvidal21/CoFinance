"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react"

interface Transaction {
  amount: number
  date: Date
  type: "INCOME" | "EXPENSE"
  category: string
}

interface StatisticsProps {
  transactions: Transaction[]
  categories: { name: string; value: number }[]
}

export default function Statistics({ transactions, categories }: StatisticsProps) {
  // Filtrar apenas despesas
  const expenses = transactions.filter(t => t.type === "EXPENSE")
  
  if (expenses.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Estatísticas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma despesa registrada neste mês
          </p>
        </CardContent>
      </Card>
    )
  }

  // Transação mais alta e mais baixa
  const amounts = expenses.map(e => Number(e.amount))
  const highestExpense = Math.max(...amounts)
  const lowestExpense = Math.min(...amounts)

  // Média de gastos por categoria
  const avgByCategory = categories.map(cat => ({
    name: cat.name,
    avg: cat.value / expenses.filter(e => e.category === cat.name).length
  })).sort((a, b) => b.avg - a.avg)[0]

  // Dia da semana com mais gastos
  const dayExpenses: Record<string, number> = {}
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  
  expenses.forEach(e => {
    const day = new Date(e.date).getDay()
    const dayName = dayNames[day]
    dayExpenses[dayName] = (dayExpenses[dayName] || 0) + Number(e.amount)
  })

  const topDay = Object.entries(dayExpenses)
    .sort(([, a], [, b]) => b - a)[0]

  // Gasto médio diário
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const uniqueDays = new Set(expenses.map(e => new Date(e.date).toDateString())).size
  const dailyAvg = totalExpense / uniqueDays

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Estatísticas do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Maior e menor despesa */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="h-4 w-4 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Maior Despesa</p>
                <p className="text-lg font-bold text-red-600">
                  R$ {highestExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Menor Despesa</p>
                <p className="text-lg font-bold text-emerald-600">
                  R$ {lowestExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Média por categoria e dia da semana */}
          <div className="space-y-3">
            {avgByCategory && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Média em {avgByCategory.name}</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {avgByCategory.avg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="h-4 w-4 text-violet-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {topDay ? `Dia com mais gastos: ${topDay[0]}` : 'Gasto médio diário'}
                </p>
                <p className="text-lg font-bold text-violet-600">
                  R$ {(topDay ? topDay[1] : dailyAvg).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gasto médio diário (sempre visível abaixo) */}
        <div className="mt-4 p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Gasto Médio Diário</span>
          <span className="text-lg font-bold text-slate-700">
            R$ {dailyAvg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
