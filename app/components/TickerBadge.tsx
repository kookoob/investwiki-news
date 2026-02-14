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
          ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300'
          : isNegative
          ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      <span className="font-semibold">{displayName}</span>
      <span>{changePercent}</span>
    </span>
  )
}
