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
  const [indices, setIndices] = useState<MarketData[]>([
    { symbol: '^IXIC', name: '나스닥', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '^DJI', name: '다우존스', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '^GSPC', name: 'S&P 500', price: '-', change: '-', changePercent: '-', loading: true },
  ])

  const [forex, setForex] = useState<MarketData[]>([
    { symbol: 'KRW=X', name: '달러/원', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'EURUSD=X', name: '유로/달러', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'JPY=X', name: '달러/엔', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'GBPUSD=X', name: '파운드/달러', price: '-', change: '-', changePercent: '-', loading: true },
  ])

  const [commodities, setCommodities] = useState<MarketData[]>([
    { symbol: 'GC=F', name: '금', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'SI=F', name: '은', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'CL=F', name: 'WTI 원유', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'NG=F', name: '천연가스', price: '-', change: '-', changePercent: '-', loading: true },
  ])

  const [crypto, setCrypto] = useState<MarketData[]>([
    { symbol: 'BTC-USD', name: '비트코인', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'ETH-USD', name: '이더리움', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'SOL-USD', name: '솔라나', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: 'BNB-USD', name: 'BNB', price: '-', change: '-', changePercent: '-', loading: true },
  ])

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 60000) // 1분마다 업데이트
    return () => clearInterval(interval)
  }, [])

  async function fetchAllData() {
    await Promise.all([
      fetchData(indices, setIndices),
      fetchData(forex, setForex),
      fetchData(commodities, setCommodities),
      fetchData(crypto, setCrypto),
    ])
  }

  async function fetchData(items: MarketData[], setter: Function) {
    const updated = await Promise.all(
      items.map(async (item) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}?interval=1d&range=1d`
          )
          const json = await res.json()
          const quote = json.chart.result[0]
          const meta = quote.meta
          const currentPrice = meta.regularMarketPrice
          const previousClose = meta.chartPreviousClose
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100

          const formatPrice = (price: number) => {
            if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            if (price >= 100) return price.toFixed(2)
            if (price >= 1) return price.toFixed(3)
            return price.toFixed(4)
          }

          return {
            ...item,
            price: `$${formatPrice(currentPrice)}`,
            change: change >= 0 ? `+${formatPrice(Math.abs(change))}` : `-${formatPrice(Math.abs(change))}`,
            changePercent: change >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
            loading: false,
          }
        } catch (error) {
          return { ...item, loading: false }
        }
      })
    )
    setter(updated)
  }

  const renderSection = (title: string, data: MarketData[]) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {data.map((item) => {
          const isPositive = item.change.startsWith('+')
          const isNegative = item.change.startsWith('-')
          
          return (
            <div key={item.symbol} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {item.loading ? '...' : item.price}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</span>
                <span
                  className={`text-xs font-medium ${
                    isPositive ? 'text-red-600 dark:text-red-400' : 
                    isNegative ? 'text-blue-600 dark:text-blue-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {item.loading ? '...' : `${isPositive ? '▲' : isNegative ? '▼' : ''} ${item.changePercent}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📊 시장 지표
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            세계 주요 지수, 환율, 원자재, 암호화폐 실시간 시세 (1분마다 자동 업데이트)
          </p>
        </div>

        {renderSection('주가지수', indices)}
        {renderSection('환율', forex)}
        {renderSection('원자재', commodities)}
        {renderSection('암호화폐', crypto)}

        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center">
          시세는 Yahoo Finance에서 제공됩니다. 1분마다 자동 업데이트됩니다.
        </div>
      </div>
    </div>
  )
}
