'use client'

import { useEffect, useState } from 'react'

interface StockPriceProps {
  ticker: string
}

interface PriceData {
  price: number
  change: number
  changePercent: number
  currency: string
}

export default function StockPrice({ ticker }: StockPriceProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchPrice() {
      try {
        const response = await fetch(`/api/stock-price?ticker=${ticker}`)
        if (response.ok) {
          const data = await response.json()
          // 데이터 유효성 검증
          if (data && typeof data.price === 'number') {
            setPriceData(data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch price:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrice()
    
    // 30초마다 갱신
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [ticker])
  
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <span className="animate-pulse">•••</span>
      </span>
    )
  }
  
  if (!priceData) {
    return null
  }
  
  const isPositive = priceData.change >= 0
  const textClass = isPositive 
    ? 'text-green-800 dark:text-green-300' 
    : 'text-red-800 dark:text-red-300'
  const bgClass = isPositive
    ? 'bg-green-50 dark:bg-green-950/40'
    : 'bg-red-50 dark:bg-red-950/40'
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-base font-bold ${textClass} ${bgClass}`}>
      <span>{priceData.currency === 'KRW' ? '₩' : '$'}{priceData.price.toLocaleString()}</span>
      <span className="text-sm font-semibold">
        {isPositive ? '▲' : '▼'} {Math.abs(priceData.changePercent).toFixed(2)}%
      </span>
    </span>
  )
}
