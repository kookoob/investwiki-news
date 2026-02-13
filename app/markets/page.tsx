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
    { symbol: '^KS11', name: '코스피', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '^KQ11', name: '코스닥', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '^N225', name: '니케이', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '000001.SS', name: '상해종합', price: '-', change: '-', changePercent: '-', loading: true },
    { symbol: '^HSI', name: '항셍', price: '-', change: '-', changePercent: '-', loading: true },
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
    const symbols = items.map(item => item.symbol).join(',')
    
    try {
      const response = await fetch(`/api/market-data?symbols=${symbols}`, {
        cache: 'no-store'
      })
      const data = await response.json()
      
      const updated = items.map(item => {
        const quote = data[item.symbol]
        if (quote && quote.price !== '-') {
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

  const renderSection = (title: string, data: MarketData[]) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {data.map((item) => {
          // 색상 적용: changePercent 기준 (예: "+0.23%" 또는 "-1.34%")
          const changePercent = item.changePercent || ''
          const isPositive = changePercent.startsWith('+')
          const isNegative = changePercent.startsWith('-')
          
          return (
            <div key={item.symbol} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</div>
                </div>
                <div className="text-right">
                  <div 
                    className={`text-base font-semibold ${
                      isPositive 
                        ? 'text-green-600 dark:text-green-400' 
                        : isNegative 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {item.loading ? '...' : item.price}
                  </div>
                  <div 
                    className={`text-sm font-medium ${
                      isPositive 
                        ? 'text-green-600 dark:text-green-400' 
                        : isNegative 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {item.loading ? '...' : `${isPositive ? '▲' : isNegative ? '▼' : ''} ${item.changePercent}`}
                  </div>
                </div>
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
      {/* 2026-02-13 21:38: Force rebuild - Asia indices added */}

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
          실시간 시세 (1분마다 자동 업데이트)
        </div>
      </div>
    </div>
  )
}
