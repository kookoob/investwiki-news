'use client'

import { useState, useMemo } from 'react'

interface NewsFiltersProps {
  news: any[]
  onFilteredNewsChange: (filteredNews: any[]) => void
}

export default function NewsFilters({ news, onFilteredNewsChange }: NewsFiltersProps) {
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedRegion, setSelectedRegion] = useState<string>('all') // 국내/외신 필터
  const [sortBy, setSortBy] = useState<'latest' | 'importance'>('latest')
  
  // 제외된 RSS 출처 (더 이상 사용 안 함)
  const excludedSources = [
    '디지털투데이',
    '매일경제',
    'The Verge',
    'BBC Business',
    'Barron.com'
  ]
  
  // 출처 목록 추출 (제외된 출처 필터링)
  const sources = useMemo(() => {
    const uniqueSources = new Set(news.map(item => item.source))
    const filteredSources = Array.from(uniqueSources).filter(
      source => !excludedSources.includes(source)
    )
    return ['all', ...filteredSources].filter(Boolean)
  }, [news])
  
  // 국내/외신 구분
  const koreanSources = ['한국경제', '연합인포맥스', 'Bloomberg 개장전 5가지']
  
  const isKoreanSource = (source: string) => {
    return koreanSources.includes(source)
  }
  
  // 필터링 & 정렬 적용
  useMemo(() => {
    let filtered = [...news]
    
    // 제외된 출처 필터링
    filtered = filtered.filter(item => !excludedSources.includes(item.source))
    
    // 출처 필터
    if (selectedSource !== 'all') {
      filtered = filtered.filter(item => item.source === selectedSource)
    }
    
    // 국내/외신 필터
    if (selectedRegion === 'domestic') {
      filtered = filtered.filter(item => isKoreanSource(item.source))
    } else if (selectedRegion === 'foreign') {
      filtered = filtered.filter(item => !isKoreanSource(item.source))
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
  }, [news, selectedSource, selectedRegion, sortBy, onFilteredNewsChange])
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        {/* 출처 필터 */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">전체 출처</option>
          {sources.filter(s => s !== 'all').map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        
        {/* 국내/외신 필터 */}
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-20 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">전체</option>
          <option value="domestic">국내</option>
          <option value="foreign">외신</option>
        </select>
        
        {/* 정렬 */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'latest' | 'importance')}
          className="w-24 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="latest">최신순</option>
          <option value="importance">중요도순</option>
        </select>
        
        {/* 필터 초기화 버튼 */}
        {(selectedSource !== 'all' || selectedRegion !== 'all' || sortBy !== 'latest') && (
          <button
            onClick={() => {
              setSelectedSource('all')
              setSelectedRegion('all')
              setSortBy('latest')
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  )
}
