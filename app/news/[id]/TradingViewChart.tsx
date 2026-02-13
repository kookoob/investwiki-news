'use client'

import { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  displayName?: string
}

export default function TradingViewChart({ symbol, displayName }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // TradingView 스크립트가 이미 로드되었는지 확인
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
      
      // 한국 주식 심볼 변환
      let tvSymbol = symbol
      if (symbol.endsWith('.KS') || symbol.endsWith('.KQ')) {
        // 한국 주식: "005930.KS" → "KRX:005930"
        const code = symbol.split('.')[0]
        tvSymbol = `KRX:${code}`
      }
      // 미국 주식은 심볼 그대로 (TradingView가 자동 인식)
      
      // 기존 위젯 제거
      containerRef.current.innerHTML = ''
      
      new (window as any).TradingView.widget({
        container_id: containerRef.current.id,
        autosize: true,
        symbol: tvSymbol,
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
      // 클린업
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol])
  
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          📈 {displayName || symbol} 차트
        </h3>
        <a 
          href={`https://www.tradingview.com/chart/?symbol=${symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          TradingView에서 보기 →
        </a>
      </div>
      <div 
        ref={containerRef}
        id={`tradingview-chart-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`}
        className="bg-white rounded-lg border border-gray-200"
        style={{ height: '400px' }}
      />
    </div>
  )
}
