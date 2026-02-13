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
  const [tickerNames, setTickerNames] = useState<Record<string, string>>({})

  // 한글 종목명 매핑 로드
  useEffect(() => {
    fetch('/ticker-names.json')
      .then(res => res.json())
      .then(setTickerNames)
      .catch(err => console.error('티커 매핑 로드 실패:', err))
  }, [])

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
            let currentPrice = meta.regularMarketPrice
            const previousClose = meta.chartPreviousClose
            
            // 한국 주식인데 통화가 USD인 경우 → KRW로 역변환
            const isKorean = symbol.endsWith('.KS') || symbol.endsWith('.KQ')
            const currency = meta.currency || 'USD'
            
            if (isKorean && currency === 'USD') {
              // USD → KRW 변환 (대략 1300배)
              // 정확한 환율은 별도 API 필요하지만, 주가 표시용으로는 근사치 사용
              currentPrice = currentPrice * 1300
            }
            
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

  // 한국 주식 여부 확인 함수
  const isKoreanStock = (symbol: string) => symbol.endsWith('.KS') || symbol.endsWith('.KQ')

  // 가격 포맷 함수
  const formatPrice = (symbol: string, price: number) => {
    if (isKoreanStock(symbol)) {
      // 한국 주식: 원화 표시 (소수점 없이)
      return `₩${Math.round(price).toLocaleString()}`
    } else {
      // 해외 주식: 달러 표시
      return `$${price.toFixed(2)}`
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">📊 관련 종목</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((item) => {
          // 한국 주식이면 한글명 우선 표시
          const koreanName = tickerNames[item.symbol]
          const displayName = koreanName || item.symbol
          const subName = koreanName ? item.symbol : item.name
          
          return (
            <div key={item.symbol} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-gray-900">{displayName}</span>
                <span className="text-base font-semibold text-gray-900">
                  {formatPrice(item.symbol, item.price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{subName}</span>
                <span
                  className={`text-xs font-medium ${
                    item.change >= 0 ? 'text-red-600' : 'text-blue-600'
                  }`}
                >
                  {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
