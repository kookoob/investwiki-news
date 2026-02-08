'use client'

import { useEffect, useState } from 'react'

interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function TickerPrices({ tickers }: { tickers: string[] }) {
  const [data, setData] = useState<TickerData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tickers || tickers.length === 0) {
      setLoading(false)
      return
    }

    const fetchPrices = async () => {
      try {
        const results = await Promise.all(
          tickers.map(async (symbol) => {
            const res = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
            )
            const json = await res.json()
            const quote = json.chart.result[0]
            const meta = quote.meta
            const currentPrice = meta.regularMarketPrice
            const previousClose = meta.chartPreviousClose
            const change = currentPrice - previousClose
            const changePercent = (change / previousClose) * 100

            return {
              symbol,
              name: meta.symbol,
              price: currentPrice,
              change,
              changePercent
            }
          })
        )
        setData(results)
      } catch (error) {
        console.error('가격 fetch 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [tickers])

  if (!tickers || tickers.length === 0) {
    return null
  }

  if (loading) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">📊 관련 종목</h3>
        <div className="text-sm text-gray-500">가격 정보 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">📊 관련 종목</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.symbol} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-medium text-gray-900">{item.symbol}</span>
              <span className="text-base font-semibold text-gray-900">
                ${item.price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{item.name}</span>
              <span
                className={`text-xs font-medium ${
                  item.change >= 0 ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
