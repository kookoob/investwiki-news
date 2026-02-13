'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'

interface MarketData {
  symbol: string
  name: string
  price: string
  change: string
  changePercent: string
  loading: boolean
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<MarketData[]>([
    { symbol: '^IXIC', name: '나스닥', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '^DJI', name: '다우존스', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '^GSPC', name: 'S&P 500', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'AAPL', name: 'Apple', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'TSLA', name: 'Tesla', price: '-', change: '-', changePercent: '-', loading: true },
  ])

  const [crypto, setCrypto] = useState<MarketData[]>([
    { symbol: 'BINANCE:BTCUSDT', name: '비트코인', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'BINANCE:ETHUSDT', name: '이더리움', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'BINANCE:SOLUSDT', name: '솔라나', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'BINANCE:BNBUSDT', name: 'BNB', price: '-', change: '-', changePercent: '-', loading: true },
  ])

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 60000) // 1분마다 업데이트
    return () => clearInterval(interval)
  }, [])

  async function fetchAllData() {
    await Promise.all([
      fetchMarketData(markets, setMarkets),
      fetchMarketData(crypto, setCrypto),
    ])
  }

  async function fetchMarketData(items: MarketData[], setter: Function) {
    const symbols = items.map(item => item.symbol).join(',')
    
    try {
      const response = await fetch(`/api/market-data?symbols=${symbols}`)
      const data = await response.json()
      
      const updated = items.map(item => {
        const quote = data[item.symbol]
        if (quote) {
          return {
            ...item,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            loading: false,
          }
        }
        return { ...item, loading: false }
      })
      
      setter(updated)
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      setter(items.map(item => ({ ...item, loading: false })))
    }
  }

  const renderTable = (title: string, data: MarketData[]) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white">종목</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white">현재가</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white">변동</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white">변동률</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const isPositive = item.change.startsWith('+')
              const isNegative = item.change.startsWith('-')
              
              return (
                <tr key={item.symbol} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</div>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 font-medium text-gray-900 dark:text-white">
                    {item.loading ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      item.price
                    )}
                  </td>
                  <td className={`text-right py-3 px-2 font-medium ${
                    isPositive ? 'text-red-600 dark:text-red-400' : 
                    isNegative ? 'text-blue-600 dark:text-blue-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {item.change}
                  </td>
                  <td className={`text-right py-3 px-2 font-medium ${
                    isPositive ? 'text-red-600 dark:text-red-400' : 
                    isNegative ? 'text-blue-600 dark:text-blue-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {item.changePercent}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📊 시장 지표
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            세계 주요 지수와 암호화폐 실시간 시세 (1분마다 자동 업데이트)
          </p>
        </div>

        {renderTable('주요 지수 & 종목', markets)}
        {renderTable('암호화폐', crypto)}

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          시세는 Finnhub API에서 제공됩니다. 1분마다 자동 업데이트됩니다.
        </div>
      </div>
    </div>
  )
}
