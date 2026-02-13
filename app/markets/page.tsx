'use client'

import { useEffect, useRef } from 'react'
import Header from '../components/Header'

export default function MarketsPage() {
  const indicesRef = useRef<HTMLDivElement>(null)
  const forexRef = useRef<HTMLDivElement>(null)
  const commoditiesRef = useRef<HTMLDivElement>(null)
  const cryptoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'
      script.async = true
      return script
    }

    // 주가지수
    if (indicesRef.current) {
      const script1 = loadScript()
      script1.innerHTML = JSON.stringify({
        width: '100%',
        height: 400,
        symbolsGroups: [{
          name: '주가지수',
          symbols: [
            { name: 'NASDAQ:NDX', displayName: '나스닥' },
            { name: 'CAPITALCOM:DJI', displayName: '다우존스' },
            { name: 'SP:SPX', displayName: 'S&P 500' },
          ]
        }],
        showSymbolLogo: true,
        isTransparent: false,
        colorTheme: 'light',
        locale: 'kr'
      })
      indicesRef.current.appendChild(script1)
    }

    // 환율
    if (forexRef.current) {
      const script2 = loadScript()
      script2.innerHTML = JSON.stringify({
        width: '100%',
        height: 400,
        symbolsGroups: [{
          name: '환율',
          symbols: [
            { name: 'FX_IDC:USDKRW', displayName: '달러/원' },
            { name: 'FX:EURUSD', displayName: '유로/달러' },
            { name: 'FX:USDJPY', displayName: '달러/엔' },
            { name: 'FX:GBPUSD', displayName: '파운드/달러' },
          ]
        }],
        showSymbolLogo: true,
        isTransparent: false,
        colorTheme: 'light',
        locale: 'kr'
      })
      forexRef.current.appendChild(script2)
    }

    // 원자재
    if (commoditiesRef.current) {
      const script3 = loadScript()
      script3.innerHTML = JSON.stringify({
        width: '100%',
        height: 400,
        symbolsGroups: [{
          name: '원자재',
          symbols: [
            { name: 'TVC:GOLD', displayName: '금' },
            { name: 'TVC:SILVER', displayName: '은' },
            { name: 'NYMEX:CL1!', displayName: 'WTI 원유' },
            { name: 'NYMEX:NG1!', displayName: '천연가스' },
          ]
        }],
        showSymbolLogo: true,
        isTransparent: false,
        colorTheme: 'light',
        locale: 'kr'
      })
      commoditiesRef.current.appendChild(script3)
    }

    // 암호화폐
    if (cryptoRef.current) {
      const script4 = loadScript()
      script4.innerHTML = JSON.stringify({
        width: '100%',
        height: 400,
        symbolsGroups: [{
          name: '암호화폐',
          symbols: [
            { name: 'BINANCE:BTCUSDT', displayName: '비트코인' },
            { name: 'BINANCE:ETHUSDT', displayName: '이더리움' },
            { name: 'BINANCE:SOLUSDT', displayName: '솔라나' },
            { name: 'BINANCE:BNBUSDT', displayName: 'BNB' },
          ]
        }],
        showSymbolLogo: true,
        isTransparent: false,
        colorTheme: 'light',
        locale: 'kr'
      })
      cryptoRef.current.appendChild(script4)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📊 시장 지표
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            세계 주요 지수, 환율, 원자재, 암호화폐 실시간 시세
          </p>
        </div>

        {/* 주가지수 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">주가지수</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div ref={indicesRef} className="tradingview-widget-container" style={{ height: '400px' }} />
          </div>
        </div>

        {/* 환율 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">환율</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div ref={forexRef} className="tradingview-widget-container" style={{ height: '400px' }} />
          </div>
        </div>

        {/* 원자재 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">원자재</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div ref={commoditiesRef} className="tradingview-widget-container" style={{ height: '400px' }} />
          </div>
        </div>

        {/* 암호화폐 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">암호화폐</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div ref={cryptoRef} className="tradingview-widget-container" style={{ height: '400px' }} />
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          시세는 TradingView에서 제공됩니다. 실시간 업데이트됩니다.
        </div>
      </div>
    </div>
  )
}
