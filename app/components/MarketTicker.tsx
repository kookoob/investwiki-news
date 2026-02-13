'use client'

import { useEffect, useState } from 'react'

interface TickerItem {
  name: string
  symbol: string
  change: string
  changePercent: string
}

export default function MarketTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>([])

  useEffect(() => {
    fetchTickers()
    const interval = setInterval(fetchTickers, 60000) // 1분마다 업데이트
    return () => clearInterval(interval)
  }, [])

  async function fetchTickers() {
    try {
      // 주요 지수만 가져오기
      const symbols = ['^IXIC', '^DJI', '^GSPC', 'KRW=X', 'GC=F', 'CL=F', 'BTC-USD'].join(',')
      const response = await fetch(`/api/market-data?symbols=${symbols}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      const nameMap: Record<string, string> = {
        '^IXIC': '나스닥',
        '^DJI': '다우존스',
        '^GSPC': 'S&P 500',
        'KRW=X': '달러/원',
        'GC=F': '금',
        'CL=F': 'WTI',
        'BTC-USD': '비트코인'
      }

      const items: TickerItem[] = []
      for (const [symbol, quote] of Object.entries(data)) {
        if (quote && typeof quote === 'object' && 'changePercent' in quote) {
          items.push({
            name: nameMap[symbol] || symbol,
            symbol,
            change: quote.change || '-',
            changePercent: quote.changePercent || '-'
          })
        }
      }

      setTickers(items)
    } catch (error) {
      console.error('Ticker fetch error:', error)
    }
  }

  if (tickers.length === 0) return null

  // 티커를 2번 복제해서 무한 루프 효과
  const duplicatedTickers = [...tickers, ...tickers, ...tickers]

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {duplicatedTickers.map((item, index) => {
            const isPositive = item.changePercent.startsWith('+')
            const isNegative = item.changePercent.startsWith('-')
            
            return (
              <span
                key={`${item.symbol}-${index}`}
                className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 
                  isNegative ? 'text-red-600 dark:text-red-400' : 
                  'text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="font-semibold">{item.name}</span>
                <span>{item.changePercent}</span>
              </span>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
        }
        
        .ticker-content {
          display: inline-flex;
          animation: scroll 45s linear infinite;
          will-change: transform;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
