"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Loader2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PendingBalance {
  from: string
  to: string
  amount: number
  isUserDebtor: boolean
  isUserCreditor: boolean
  fromUserId?: string
  toUserId?: string
}

interface PendingBalancesProps {
  balances: PendingBalance[]
  onSettled?: () => void
}

export default function PendingBalances({ balances, onSettled }: PendingBalancesProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  if (balances.length === 0) {
    return (
      <div className="py-8 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-muted-foreground text-sm">Tudo em dia! Nenhuma pendência.</p>
      </div>
    )
  }

  const handleSettle = async (balance: PendingBalance) => {
    if (!balance.toUserId) {
      toast.error("Erro: ID do credor não encontrado")
      return
    }

    const settlementKey = `${balance.fromUserId}-${balance.toUserId}`
    setProcessingId(settlementKey)

    try {
      const response = await fetch("/api/balances/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditorId: balance.toUserId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao registrar pagamento")
      }

      toast.success("Pagamento registrado com sucesso!", {
        description: `R$ ${data.totalAmount.toFixed(2)} quitado com ${balance.to}`,
        duration: 4000,
      })
      
      if (onSettled) {
        setTimeout(() => {
          onSettled()
        }, 800)
      }
    } catch (err) {
      toast.error("Erro ao processar pagamento", {
        description: err instanceof Error ? err.message : "Tente novamente mais tarde",
        duration: 4000,
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {balances.map((balance, index) => {
        const settlementKey = `${balance.fromUserId}-${balance.toUserId}`
        const isProcessing = processingId === settlementKey

        return (
          <div 
            key={index} 
            className="flex flex-col gap-3 p-4 bg-gradient-to-br from-white/50 to-white/30 dark:from-white/5 dark:to-white/2 rounded-xl border border-border/30 hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold text-primary ring-2 ring-white dark:ring-gray-900">
                    {balance.from[0]}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-xs font-semibold text-secondary ring-2 ring-white dark:ring-gray-900">
                    {balance.to[0]}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{balance.isUserDebtor ? 'Você deve para' : `${balance.from} deve para`}</span>
                  <span className="font-semibold text-foreground">{balance.isUserDebtor ? balance.to : balance.to}</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  R$ {balance.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            {balance.isUserDebtor && (
              <Button 
                variant="gradient"
                size="sm"
                className="w-full"
                onClick={() => handleSettle(balance)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Quitar Pendências
                  </>
                )}
              </Button>
            )}
            
            {balance.isUserCreditor && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Aguardando pagamento
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}