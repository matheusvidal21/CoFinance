"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Settlement {
  id: string
  amount: number
  settledAt: string
  debtor: {
    name: string
  }
  creditor: {
    name: string
  }
}

interface SettlementHistoryProps {
  refreshTrigger?: number
}

export default function SettlementHistory({ refreshTrigger }: SettlementHistoryProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/balances/history")
        if (res.ok) {
          const data = await res.json()
          setSettlements(data.settlements || [])
        }
      } catch (error) {
        console.error("Failed to load settlement history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isExpanded) {
      fetchHistory()
    }
  }, [isExpanded, refreshTrigger])

  if (isLoading && isExpanded) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico de Quitações
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center py-4 text-muted-foreground text-xs">
          Carregando histórico...
        </div>
      </div>
    )
  }

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setIsExpanded(true)}
      >
        <Clock className="h-4 w-4 mr-2" />
        Ver Histórico de Quitações
        <ChevronDown className="h-4 w-4 ml-auto" />
      </Button>
    )
  }

  const displayedSettlements = showAll ? settlements : settlements.slice(0, 3)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Histórico de Quitações
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-xs">Nenhuma quitação registrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className={`space-y-2 ${showAll ? 'max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent' : ''}`}>
            {displayedSettlements.map((settlement) => (
              <div
                key={settlement.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-xs">
                      {settlement.debtor.name} → {settlement.creditor.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(settlement.settledAt), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-emerald-600">
                    R$ {settlement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {settlements.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  Ver menos
                  <ChevronUp className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Ver todas ({settlements.length})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
