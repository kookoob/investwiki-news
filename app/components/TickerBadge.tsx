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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors`}
      style={
        isPositive ? {
          backgroundColor: '#1a3a1a',
          color: '#86efac'
        } : isNegative ? {
          backgroundColor: '#3a1a1a',
          color: '#fca5a5'
        } : {
          backgroundColor: '#2a2a2a',
          color: '#d1d5dc'
        }
      }
    >
      <span className="font-semibold">{displayName}</span>
      <span>{changePercent}</span>
    </span>
  )
}
