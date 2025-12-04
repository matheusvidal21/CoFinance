import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"
import { calculatePendingBalances } from "@/lib/calculations"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    // Get user's group
    const membership = await prisma.sharedGroupMember.findFirst({
      where: { userId: session.user.id },
      include: { group: true }
    })

    if (!membership) {
      return NextResponse.json({ hasGroup: false })
    }

    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    // Fetch shared transactions for the group
    const transactions = await prisma.transaction.findMany({
      where: {
        groupId: membership.groupId,
        isShared: true,
        date: {
          gte: start,
          lte: end
        }
      }
    })

    // Calculate totals (Group total)
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

    // Calculate Pending Balances (All time, not just this month)
    // Fetch all unpaid divisions for the group
    const unpaidDivisions = await prisma.transactionDivision.findMany({
      where: {
        transaction: {
          groupId: membership.groupId
        },
        isPaid: false
      },
      include: {
        transaction: {
          select: { userId: true } // Payer
        }
      }
    })

    const pendingBalances = calculatePendingBalances(unpaidDivisions.map(d => ({
      userId: d.userId,
      amount: Number(d.amount),
      isPaid: d.isPaid,
      transaction: { userId: d.transaction.userId }
    })))

    // Enrich pending balances with user names
    const userIds = new Set<string>()
    pendingBalances.forEach(pb => {
      userIds.add(pb.fromUserId)
      userIds.add(pb.toUserId)
    })

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true }
    })

    const userMap = new Map(users.map(u => [u.id, u.name]))

    const enrichedBalances = pendingBalances.map(pb => ({
      from: userMap.get(pb.fromUserId) || "Desconhecido",
      to: userMap.get(pb.toUserId) || "Desconhecido",
      amount: pb.amount,
      isUserDebtor: pb.fromUserId === session.user.id,
      isUserCreditor: pb.toUserId === session.user.id,
      fromUserId: pb.fromUserId,
      toUserId: pb.toUserId
    }))

    // Fetch recent shared transactions (last 10)
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        groupId: membership.groupId,
        isShared: true,
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
        user: {
          select: {
            name: true,
          }
        }
      }
    })

    return NextResponse.json({
      hasGroup: true,
      groupName: membership.group.name,
      summary: {
        income,
        expense,
        balance: income - expense
      },
      categories: Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      pendingBalances: enrichedBalances,
      recentTransactions,
      transactions // Transações do mês para estatísticas
    })
  } catch (error) {
    console.error("Shared dashboard error:", error)
    return NextResponse.json(
      { error: "Erro ao carregar dashboard compartilhado" },
      { status: 500 }
    )
  }
}
