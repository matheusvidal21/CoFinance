"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowUpCircle, ArrowDownCircle, Receipt, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Transaction {
  id: string
  amount: number
  type: "INCOME" | "EXPENSE"
  category: string
  description: string
  date: string
  user?: {
    name: string
  }
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  showUser?: boolean
}

export default function RecentTransactions({ transactions, showUser = false }: RecentTransactionsProps) {
  const [displayCount, setDisplayCount] = useState(5)
  
  const displayedTransactions = transactions.slice(0, displayCount)
  const hasMore = transactions.length > displayCount

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
          <Receipt className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground text-sm">Nenhuma transação registrada ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {displayedTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-white/50 to-white/30 dark:from-white/5 dark:to-white/2 rounded-xl border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
              transaction.type === "INCOME" 
                ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "bg-gradient-to-br from-rose-500/20 to-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}>
              {transaction.type === "INCOME" ? (
                <ArrowUpCircle className="h-5 w-5" />
              ) : (
                <ArrowDownCircle className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">{transaction.description}</p>
                {showUser && transaction.user && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {transaction.user.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted/50 text-muted-foreground">
                  {transaction.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(transaction.date), "dd 'de' MMM", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          <div className={`text-base font-bold whitespace-nowrap ml-4 ${
            transaction.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}>
            {transaction.type === "INCOME" ? "+" : "-"} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      ))}
      </div>
      
      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setDisplayCount(prev => prev + 5)}
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          Carregar mais ({transactions.length - displayCount} restantes)
        </Button>
      )}
    </div>
  )
}