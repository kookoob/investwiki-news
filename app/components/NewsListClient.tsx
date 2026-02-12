'use client'

import { useState } from 'react'
import Link from 'next/link'
import NewsFilters from './NewsFilters'
import StockPrice from './StockPrice'

interface NewsListClientProps {
  initialNews: any[]
  stats: Record<string, { bullish: number; bearish: number; comments: number }>
}

// 지수 티커 표시명 매핑
const TICKER_DISPLAY_NAMES: Record<string, string> = {
  '^DJI': 'DOW',
  '^IXIC': 'NASDAQ',
  '^GSPC': 'S&P 500',
  '^RUT': 'Russell 2000',
  '^VIX': 'VIX',
  '^TNX': '10Y Treasury',
  '^FTSE': 'FTSE 100',
  '^N225': 'Nikkei',
  '^HSI': 'Hang Seng',
}

function getTickerDisplayName(ticker: string): string {
  return TICKER_DISPLAY_NAMES[ticker] || ticker
}

export default function NewsListClient({ initialNews, stats }: NewsListClientProps) {
  const [filteredNews, setFilteredNews] = useState(initialNews)
  
  return (
    <div className="flex-1 space-y-4">
      {/* 필터/정렬 UI */}
      <NewsFilters 
        news={initialNews} 
        onFilteredNewsChange={setFilteredNews}
      />
      
      {/* 뉴스 목록 */}
      {filteredNews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          조건에 맞는 뉴스가 없습니다
        </div>
      )}
      
      {filteredNews.map((item: any, index: number) => {
        const itemStats = stats[item.id] || { bullish: 0, bearish: 0, comments: 0 }
        
        return (
          <div key={item.id}>
            <Link href={`/news/${item.id}`} className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                {item.title}
              </h2>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="font-medium text-blue-600 dark:text-blue-400">{item.source}</span>
                <span>•</span>
                <span>{item.date}</span>
                
                {/* AI 판단 등급 별점 */}
                {item.importance && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-0.5" title={`AI 판단 등급: ${
                      item.importance === 'very_high' ? '매우 높음' :
                      item.importance === 'high' ? '높음' :
                      item.importance === 'medium' ? '보통' :
                      item.importance === 'low' ? '낮음' : '매우 낮음'
                    }`}>
                      {item.importance === 'very_high' && '⭐⭐⭐⭐⭐'}
                      {item.importance === 'high' && '⭐⭐⭐⭐'}
                      {item.importance === 'medium' && '⭐⭐⭐'}
                      {item.importance === 'low' && '⭐⭐'}
                      {item.importance === 'very_low' && '⭐'}
                    </span>
                  </>
                )}
                
                {/* 티커 + 실시간 주가 */}
                {item.tickers && item.tickers.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tickers.slice(0, 3).map((ticker: string) => (
                        <StockPrice 
                          key={ticker} 
                          ticker={ticker} 
                          displayName={getTickerDisplayName(ticker)} 
                        />
                      ))}
                      {item.tickers.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{item.tickers.length - 3}
                        </span>
                      )}
                    </div>
                  </>
                )}
                
                {/* 투표/댓글 통계 */}
                <span>•</span>
                <div className="flex items-center gap-3">
                  {/* 호재 */}
                  <span className="flex items-center gap-1 text-green-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {itemStats.bullish || 0}
                  </span>
                  
                  {/* 악재 */}
                  <span className="flex items-center gap-1 text-red-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    {itemStats.bearish || 0}
                  </span>
                  
                  {/* 댓글 */}
                  <span className="flex items-center gap-1 text-gray-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {itemStats.comments || 0}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
