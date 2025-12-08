import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    // Get user's group
    const membership = await prisma.sharedGroupMember.findFirst({
      where: { userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json({ settlements: [] })
    }

    // Fetch paid divisions (settlements) for the group
    const paidDivisions = await prisma.transactionDivision.findMany({
      where: {
        isPaid: true,
        paidAt: {
          not: null
        },
        transaction: {
          groupId: membership.groupId,
          isShared: true,
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        paidAt: true,
        userId: true,
        transaction: {
          select: {
            userId: true,
            description: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Group by debtor-creditor and sum amounts
    const settlementMap = new Map<string, {
      debtorId: string,
      creditorId: string,
      amount: number,
      paidAt: Date,
      description: string
    }>()

    for (const division of paidDivisions) {
      if (!division.paidAt) continue // Extra safety check
      
      const debtorId = division.userId
      const creditorId = division.transaction.userId
      const key = `${debtorId}-${creditorId}-${division.paidAt.toISOString()}`
      
      if (!settlementMap.has(key)) {
        settlementMap.set(key, {
          debtorId,
          creditorId,
          amount: Number(division.amount),
          paidAt: division.paidAt,
          description: division.transaction.description
        })
      } else {
        const existing = settlementMap.get(key)!
        existing.amount += Number(division.amount)
      }
    }

    // Get user names
    const userIds = new Set<string>()
    settlementMap.forEach(s => {
      userIds.add(s.debtorId)
      userIds.add(s.creditorId)
    })

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true }
    })

    const userMap = new Map(users.map(u => [u.id, u.name]))

    // Format settlements
    const settlements = Array.from(settlementMap.values()).map((s, index) => ({
      id: `${s.debtorId}-${s.creditorId}-${index}`,
      amount: s.amount,
      settledAt: s.paidAt.toISOString(),
      debtor: {
        name: userMap.get(s.debtorId) || "Desconhecido"
      },
      creditor: {
        name: userMap.get(s.creditorId) || "Desconhecido"
      }
    }))

    return NextResponse.json({ settlements })
  } catch (error) {
    console.error("Settlement history error:", error)
    return NextResponse.json(
      { error: "Erro ao carregar histórico" },
      { status: 500 }
    )
  }
}
