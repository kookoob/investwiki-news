'use client'

import { useEffect, useState } from 'react'

interface TickerBadgeProps {
  ticker: string
  displayName: string
}

export default function TickerBadge({ ticker, displayName }: TickerBadgeProps) {
  const [changePercent, setChangePercent] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/market-data?symbols=${ticker}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const quote = data[ticker]
        if (quote && quote.changePercent) {
          setChangePercent(quote.changePercent)
        }
      })
      .catch(() => {})
  }, [ticker])

  if (!changePercent) return null

  const isPositive = changePercent.startsWith('+')
  const isNegative = changePercent.startsWith('-')

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        isPositive
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : isNegative
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      <span className="font-semibold">{displayName}</span>
      <span>{changePercent}</span>
    </span>
  )
}
