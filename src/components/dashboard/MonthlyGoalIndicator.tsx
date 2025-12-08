"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, AlertCircle } from "lucide-react"

interface MonthlyGoalIndicatorProps {
  monthlyIncome: number
  expense: number
}

export default function MonthlyGoalIndicator({ monthlyIncome, expense }: MonthlyGoalIndicatorProps) {
  if (!monthlyIncome || monthlyIncome === 0) {
    return null
  }

  const percentage = Math.min((expense / monthlyIncome) * 100, 100)
  const remaining = monthlyIncome - expense
  const isOverBudget = expense > monthlyIncome

  const getStatusColor = () => {
    if (isOverBudget) return "bg-red-500"
    if (percentage > 90) return "bg-orange-500"
    if (percentage > 70) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  const getStatusText = () => {
    if (isOverBudget) return "Acima da renda"
    if (percentage > 90) return "Atenção! Próximo do limite"
    if (percentage > 70) return "Bom controle"
    return "Excelente controle!"
  }

  return (
    <Card className="glass-card overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none"></div>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Meta Mensal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Gastos do mês</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Renda declarada</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStatusColor()} transition-all duration-500 ease-out relative`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              {percentage.toFixed(1)}% utilizado
            </span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
              {isOverBudget ? 'Acima' : 'Restante'}: R$ {Math.abs(remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isOverBudget 
            ? 'bg-red-500/10 border border-red-500/20' 
            : percentage > 90 
              ? 'bg-orange-500/10 border border-orange-500/20'
              : 'bg-emerald-500/10 border border-emerald-500/20'
        }`}>
          {isOverBudget ? (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          ) : (
            <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          <span className={`text-sm font-medium ${
            isOverBudget 
              ? 'text-red-700 dark:text-red-400' 
              : percentage > 90
                ? 'text-orange-700 dark:text-orange-400'
                : 'text-emerald-700 dark:text-emerald-400'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
