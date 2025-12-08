"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, Wallet, Users, TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import PendingBalances from "@/components/dashboard/PendingBalances"
import RecentTransactions from "@/components/dashboard/RecentTransactions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Statistics from "./Statistics"

interface SharedDashboardData {
  hasGroup: boolean
  groupName?: string
  summary?: {
    income: number
    expense: number
    balance: number
  }
  categories?: { name: string; value: number }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingBalances?: any[] 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentTransactions?: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions?: any[]
}

export default function SharedView() {
  const [data, setData] = useState<SharedDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard/shared")
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) return (
    <div className="py-10 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-2 text-muted-foreground">Carregando...</p>
    </div>
  )
  if (!data) return <div className="py-10 text-center text-muted-foreground">Erro ao carregar dados</div>

  if (!data.hasGroup) {
    return (
      <div className="glass-card p-12 text-center space-y-6">
        <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">Sem grupo compartilhado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Crie ou entre em um grupo para visualizar as finanças compartilhadas com seus amigos ou familiares.
          </p>
        </div>
        <Link href="/shared-group">
          <Button variant="gradient" size="lg" className="mt-2">
            <Users className="h-4 w-4 mr-2" />
            Ir para Grupo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {data.groupName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {data.transactions?.length || 0} transações este mês
            </p>
          </div>
        </div>
      </div>

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
              R$ {(data.summary?.income || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
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
              R$ {(data.summary?.expense || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            <div className={`text-3xl font-bold tracking-tight ${(data.summary?.balance || 0) >= 0 ? 'text-foreground' : 'text-rose-600 dark:text-rose-400'}`}>
              R$ {(data.summary?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.transactions && data.transactions.length > 0 && (
        <Statistics 
          transactions={data.transactions} 
          categories={data.categories || []} 
        />
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="glass-card lg:col-span-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 pointer-events-none"></div>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
              Acerto de Contas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingBalances balances={data.pendingBalances || []} onSettled={fetchData} />
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data.categories && data.categories.length > 0 ? (
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
                      fill="url(#sharedColorGradient)" 
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="sharedColorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#764ba2" />
                        <stop offset="100%" stopColor="#f093fb" />
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
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions 
            transactions={data.recentTransactions || []} 
            showUser={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}