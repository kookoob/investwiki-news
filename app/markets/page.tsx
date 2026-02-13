'use client'

import { useEffect, useRef } from 'react'
import Header from '../components/Header'

export default function MarketsPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // TradingView 위젯: 시장 시세표 (차트 없이 수치만)
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: 600,
      symbolsGroups: [
        {
          name: '주가지수',
          symbols: [
            { name: 'KRX:KOSPI', displayName: '코스피' },
            { name: 'KRX:KOSDAQ', displayName: '코스닥' },
            { name: 'NASDAQ:NDX', displayName: '나스닥' },
            { name: 'CAPITALCOM:DJI', displayName: '다우존스' },
            { name: 'SP:SPX', displayName: 'S&P 500' },
            { name: 'CME_MINI:NQ1!', displayName: '나스닥100 선물' },
          ],
        },
        {
          name: '환율',
          symbols: [
            { name: 'TVC:DXY', displayName: '달러 인덱스' },
            { name: 'FX_IDC:USDKRW', displayName: '달러/원' },
            { name: 'FX:EURUSD', displayName: '유로/달러' },
            { name: 'FX:USDJPY', displayName: '달러/엔' },
            { name: 'FX:GBPUSD', displayName: '파운드/달러' },
          ],
        },
        {
          name: '원자재',
          symbols: [
            { name: 'TVC:GOLD', displayName: '금' },
            { name: 'TVC:SILVER', displayName: '은' },
            { name: 'NYMEX:CL1!', displayName: 'WTI 원유' },
            { name: 'NYMEX:NG1!', displayName: '천연가스' },
            { name: 'CBOT:ZC1!', displayName: '옥수수' },
          ],
        },
        {
          name: '암호화폐',
          symbols: [
            { name: 'BINANCE:BTCUSDT', displayName: '비트코인' },
            { name: 'BINANCE:ETHUSDT', displayName: '이더리움' },
            { name: 'BINANCE:SOLUSDT', displayName: '솔라나' },
            { name: 'BINANCE:BNBUSDT', displayName: 'BNB' },
          ],
        },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      colorTheme: 'light',
      locale: 'kr',
    })

    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(script)
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* 페이지 제목 */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
            📊 시장 지표
          </h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            세계 주요 지수, 환율, 원자재, 암호화폐 실시간 시세
          </p>
        </div>

        {/* TradingView 시세표 (차트 없음) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-6">
          <div className="tradingview-widget-container" style={{ minHeight: '600px' }}>
            <div ref={containerRef} className="tradingview-widget-container__widget"></div>
            <div className="tradingview-widget-copyright text-xs text-gray-400 mt-2">
              <a
                href="https://kr.tradingview.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="blue-text">TradingView에서 제공</span>
              </a>
            </div>
          </div>
        </div>

        {/* 면책 조항 */}
        <div className="mt-4 md:mt-6 text-xs text-gray-500 dark:text-gray-400 text-center px-2">
          시세는 TradingView에서 제공됩니다. 실시간이 아닐 수 있으며 정확성을 보장하지 않습니다.
        </div>
      </div>
    </div>
  )
}
