"use client"

import { useStore } from "@/lib/store"

export default function HistoryPage() {
  const { transactions } = useStore()

  const sortedTransactions = transactions.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  return (
    <main className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-xl font-bold">Bitcoin Deepa</h1>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Transactions</h2>
      </div>

      {/* Transactions List */}
      <div className="space-y-0">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-4 border-b border-gray-800 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className="text-gray-400 text-xs">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </p>
                <p className="text-xs text-gray-400 capitalize">{transaction.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </main>
  )
}
