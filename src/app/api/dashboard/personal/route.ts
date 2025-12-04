import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    // Get user's monthly income
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { monthlyIncome: true }
    })

    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    // Fetch personal transactions (not shared)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        isShared: false,
        date: {
          gte: start,
          lte: end
        }
      }
    })

    // Calculate totals
    let income = 0
    let expense = 0
    const categoryTotals: Record<string, number> = {}

    transactions.forEach(tx => {
      const amount = Number(tx.amount)
      if (tx.type === "INCOME") {
        income += amount
      } else {
        expense += amount
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amount
      }
    })

    // Add monthly income if it exists
    const monthlyIncome = user?.monthlyIncome ? Number(user.monthlyIncome) : 0
    income += monthlyIncome

    // Fetch recent personal transactions (last 10)
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        isShared: false,
      },
      orderBy: { date: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        description: true,
        date: true,
      }
    })

    return NextResponse.json({
      summary: {
        income,
        expense,
        balance: income - expense
      },
      monthlyIncome, // Include for display
      categories: Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      recentTransactions,
      transactions // Transações do mês para estatísticas
    })
  } catch (error) {
    console.error("Personal dashboard error:", error)
    return NextResponse.json(
      { error: "Erro ao carregar dashboard pessoal" },
      { status: 500 }
    )
  }
}
