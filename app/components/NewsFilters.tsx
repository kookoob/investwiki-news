'use client'

import { useState, useMemo } from 'react'

interface NewsFiltersProps {
  news: any[]
  onFilteredNewsChange: (filteredNews: any[]) => void
}

export default function NewsFilters({ news, onFilteredNewsChange }: NewsFiltersProps) {
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedTicker, setSelectedTicker] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'importance'>('latest')
  
  // 출처 목록 추출
  const sources = useMemo(() => {
    const uniqueSources = new Set(news.map(item => item.source))
    return ['all', ...Array.from(uniqueSources)].filter(Boolean)
  }, [news])
  
  // 티커 목록 추출
  const tickers = useMemo(() => {
    const uniqueTickers = new Set<string>()
    news.forEach(item => {
      if (item.tickers && Array.isArray(item.tickers)) {
        item.tickers.forEach((ticker: string) => uniqueTickers.add(ticker))
      }
    })
    return ['all', ...Array.from(uniqueTickers)].filter(Boolean).sort()
  }, [news])
  
  // 필터링 & 정렬 적용
  useMemo(() => {
    let filtered = [...news]
    
    // 출처 필터
    if (selectedSource !== 'all') {
      filtered = filtered.filter(item => item.source === selectedSource)
    }
    
    // 티커 필터
    if (selectedTicker !== 'all') {
      filtered = filtered.filter(item => 
        item.tickers && item.tickers.includes(selectedTicker)
      )
    }
    
    // 정렬
    if (sortBy === 'importance') {
      const importanceOrder = {
        'very_high': 5,
        'high': 4,
        'medium': 3,
        'low': 2,
        'very_low': 1
      }
      filtered.sort((a, b) => {
        const scoreA = importanceOrder[a.importance as keyof typeof importanceOrder] || 0
        const scoreB = importanceOrder[b.importance as keyof typeof importanceOrder] || 0
        return scoreB - scoreA
      })
    } else {
      // 최신순 (기본)
      filtered.sort((a, b) => b.timestamp - a.timestamp)
    }
    
    onFilteredNewsChange(filtered)
  }, [news, selectedSource, selectedTicker, sortBy, onFilteredNewsChange])
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 출처 필터 */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            출처
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            {sources.filter(s => s !== 'all').map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        
        {/* 티커 필터 */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            종목
          </label>
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            {tickers.filter(t => t !== 'all').map(ticker => (
              <option key={ticker} value={ticker}>{ticker}</option>
            ))}
          </select>
        </div>
        
        {/* 정렬 */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            정렬
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'importance')}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="latest">최신순</option>
            <option value="importance">중요도순</option>
          </select>
        </div>
      </div>
      
      {/* 필터 초기화 버튼 */}
      {(selectedSource !== 'all' || selectedTicker !== 'all' || sortBy !== 'latest') && (
        <button
          onClick={() => {
            setSelectedSource('all')
            setSelectedTicker('all')
            setSortBy('latest')
          }}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          필터 초기화
        </button>
      )}
    </div>
  )
}
