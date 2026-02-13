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
    if (!containerRef.current) return
    
    // TradingView 위젯 로드
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
  
  // 외부 링크
  const getExternalLink = () => {
    if (isKorean) {
      const code = symbol.split('.')[0]
      return {
        url: `https://finance.naver.com/item/main.naver?code=${code}`,
        text: '네이버 금융에서 보기 →'
      }
    }
    return {
      url: `https://www.tradingview.com/chart/?symbol=${symbol}`,
      text: 'TradingView에서 보기 →'
    }
  }
  
  const link = getExternalLink()
  
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          📈 {displayName || symbol} 차트
        </h3>
        <a 
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          {link.text}
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
