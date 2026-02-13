'use client'

import { useEffect, useRef } from 'react'
import Header from '../components/Header'

export default function MarketsPage() {
  const container1Ref = useRef<HTMLDivElement>(null)
  const container2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // TradingView 위젯 1: 시장 시세표
    const script1 = document.createElement('script')
    script1.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'
    script1.type = 'text/javascript'
    script1.async = true
    script1.innerHTML = JSON.stringify({
      width: '100%',
      height: 500,
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
          ],
        },
        {
          name: '원자재',
          symbols: [
            { name: 'TVC:GOLD', displayName: '금' },
            { name: 'TVC:SILVER', displayName: '은' },
            { name: 'NYMEX:CL1!', displayName: 'WTI 원유' },
            { name: 'NYMEX:NG1!', displayName: '천연가스' },
          ],
        },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      colorTheme: 'light',
      locale: 'kr',
    })

    // TradingView 위젯 2: 시장 오버뷰
    const script2 = document.createElement('script')
    script2.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script2.type = 'text/javascript'
    script2.async = true
    script2.innerHTML = JSON.stringify({
      colorTheme: 'light',
      dateRange: '1D',
      showChart: true,
      locale: 'kr',
      width: '100%',
      height: 500,
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
      plotLineColorFalling: 'rgba(41, 98, 255, 1)',
      gridLineColor: 'rgba(240, 243, 250, 0)',
      scaleFontColor: 'rgba(106, 109, 120, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      tabs: [
        {
          title: '지수',
          symbols: [
            { s: 'KRX:KOSPI', d: '코스피' },
            { s: 'KRX:KOSDAQ', d: '코스닥' },
            { s: 'NASDAQ:NDX', d: '나스닥' },
            { s: 'CAPITALCOM:DJI', d: '다우존스' },
            { s: 'SP:SPX', d: 'S&P 500' },
          ],
        },
        {
          title: '환율',
          symbols: [
            { s: 'FX:EURUSD', d: '유로/달러' },
            { s: 'FX:GBPUSD', d: '파운드/달러' },
            { s: 'FX:USDJPY', d: '달러/엔' },
            { s: 'FX_IDC:USDKRW', d: '달러/원' },
          ],
        },
        {
          title: '원자재',
          symbols: [
            { s: 'TVC:GOLD', d: '금' },
            { s: 'TVC:SILVER', d: '은' },
            { s: 'NYMEX:CL1!', d: 'WTI 원유' },
            { s: 'NYMEX:NG1!', d: '천연가스' },
          ],
        },
      ],
    })

    if (container1Ref.current) {
      container1Ref.current.innerHTML = ''
      container1Ref.current.appendChild(script1)
    }

    if (container2Ref.current) {
      container2Ref.current.innerHTML = ''
      container2Ref.current.appendChild(script2)
    }

    return () => {
      if (container1Ref.current) container1Ref.current.innerHTML = ''
      if (container2Ref.current) container2Ref.current.innerHTML = ''
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
            세계 주요 지수, 환율, 원자재 실시간 시세
          </p>
        </div>

        {/* TradingView 위젯 2: 시장 요약 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-6 mb-4 md:mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
            시장 요약
          </h2>
          <div className="tradingview-widget-container" style={{ minHeight: '500px' }}>
            <div ref={container2Ref} className="tradingview-widget-container__widget"></div>
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

        {/* TradingView 위젯 1: 시세표 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
            실시간 시세
          </h2>
          <div className="tradingview-widget-container" style={{ minHeight: '500px' }}>
            <div ref={container1Ref} className="tradingview-widget-container__widget"></div>
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
