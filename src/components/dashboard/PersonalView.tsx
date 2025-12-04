"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import RecentTransactions from "./RecentTransactions"
import Statistics from "./Statistics"

interface DashboardData {
  summary: {
    income: number
    expense: number
    balance: number
  }
  monthlyIncome?: number
  categories: { name: string; value: number }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentTransactions?: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions?: any[]
}

export default function PersonalView() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/personal")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return (
    <div className="py-10 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-2 text-muted-foreground">Carregando...</p>
    </div>
  )
  if (!data) return <div className="py-10 text-center text-muted-foreground">Erro ao carregar dados</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="glass-card group hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 cursor-default overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas Totais</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              R$ {data.summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {data.monthlyIncome && data.monthlyIncome > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Renda fixa:</span>
                  <span className="font-semibold text-foreground">R$ {data.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {(data.summary.income - data.monthlyIncome) > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Receitas variáveis:</span>
                    <span className="font-semibold text-foreground">R$ {(data.summary.income - data.monthlyIncome).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card group hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 cursor-default overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Totais</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingDown className="h-5 w-5 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
              R$ {data.summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card group hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 cursor-default overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${data.summary.balance >= 0 ? 'text-foreground' : 'text-rose-600 dark:text-rose-400'}`}>
              R$ {data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.transactions && data.transactions.length > 0 && (
        <Statistics 
          transactions={data.transactions} 
          categories={data.categories} 
        />
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {data.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categories} barCategoryGap="20%">
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$${value}`}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(102, 126, 234, 0.05)', radius: 8 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(102, 126, 234, 0.2)', 
                      boxShadow: '0 8px 24px rgba(45, 55, 72, 0.12)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ color: '#2d3748', fontWeight: 600, marginBottom: '4px' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <ArrowDownCircle className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p>Sem dados de despesas este mês</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions transactions={data.recentTransactions || []} />
        </CardContent>
      </Card>
    </div>
  )
}