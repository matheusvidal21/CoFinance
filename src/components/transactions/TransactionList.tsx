"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ArrowDownCircle, ArrowUpCircle, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  amount: string
  type: "INCOME" | "EXPENSE"
  category: string
  description: string
  date: string
  isShared: boolean
  user: { name: string }
}

export default function TransactionList({ type = "all", refreshTrigger }: { type?: string, refreshTrigger?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
  }, [type, refreshTrigger])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/transactions?type=${type}`)
        const data = await res.json()
        
        if (Array.isArray(data)) {
          setTransactions(data)
        } else {
          setTransactions([])
        }
      } catch (err) {
        console.error("Failed to load transactions", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [type, refreshTrigger])

  if (isLoading) {
    return <div className="text-center py-10 text-muted-foreground">Carregando transações...</div>
  }

  if (transactions.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">Nenhuma transação encontrada.</div>
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              transaction.type === "INCOME" 
                ? "bg-green-100 text-green-600 dark:bg-green-900/20" 
                : "bg-red-100 text-red-600 dark:bg-red-900/20"
            )}>
              {transaction.type === "INCOME" ? <ArrowUpCircle className="h-6 w-6" /> : <ArrowDownCircle className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{format(new Date(transaction.date), "dd/MM/yyyy")}</span>
                <span>•</span>
                <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                  {transaction.category}
                </Badge>
                {transaction.isShared && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 h-5 gap-1">
                    <Users className="h-3 w-3" />
                    Compartilhado
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className={cn(
              "font-bold text-lg",
              transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
            )}>
              {transaction.type === "INCOME" ? "+" : "-"} R$ {Number(transaction.amount).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
              <User className="h-3 w-3" />
              {transaction.user.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}