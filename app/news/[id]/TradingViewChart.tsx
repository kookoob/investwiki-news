'use client'

import { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  displayName?: string
}

export default function TradingViewChart({ symbol, displayName }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isKorean = symbol.endsWith('.KS') || symbol.endsWith('.KQ')
  
  useEffect(() => {
    if (isKorean || !containerRef.current) return
    
    // 미국 주식만 TradingView 위젯 사용
    if (!(window as any).TradingView) {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => initWidget()
      document.head.appendChild(script)
    } else {
      initWidget()
    }
    
    function initWidget() {
      if (!containerRef.current) return
      
      containerRef.current.innerHTML = ''
      
      new (window as any).TradingView.widget({
        container_id: containerRef.current.id,
        autosize: true,
        symbol: symbol,
        interval: 'D',
        timezone: 'Asia/Seoul',
        theme: 'light',
        style: '1',
        locale: 'kr',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        hide_volume: false,
        support_host: 'https://www.tradingview.com'
      })
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, isKorean])
  
  // 한국 주식: 네이버 금융 차트
  if (isKorean) {
    const code = symbol.split('.')[0]
    
    return (
      <div className="my-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            📈 {displayName || symbol} 차트
          </h3>
          <a 
            href={`https://finance.naver.com/item/main.naver?code=${code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            네이버 금융에서 보기 →
          </a>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <iframe
            src={`https://finance.naver.com/item/fchart.naver?code=${code}`}
            width="100%"
            height="400"
            frameBorder={0}
            scrolling="no"
          />
        </div>
      </div>
    )
  }
  
  // 미국 주식: TradingView 위젯
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          📈 {displayName || symbol} 차트
        </h3>
        <a 
          href={`https://www.tradingview.com/chart/?symbol=${symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          TradingView에서 보기 →
        </a>
      </div>
      <div 
        ref={containerRef}
        id={`tradingview-chart-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height: '400px' }}
      />
    </div>
  )
}
