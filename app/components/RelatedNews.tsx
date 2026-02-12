'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RelatedNewsProps {
  currentNewsId: string
  tickers: string[]
  title: string
}

interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  tickers?: string[]
  importance?: string
}

export default function RelatedNews({ currentNewsId, tickers, title }: RelatedNewsProps) {
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchRelatedNews() {
      try {
        // 모든 뉴스 페이지 로드
        let allNews: NewsItem[] = []
        let page = 1
        
        while (page <= 5) { // 최대 5페이지 (250개)
          const response = await fetch(`/news-${page}.json`)
          if (!response.ok) break
          
          const pageNews = await response.json()
          if (pageNews.length === 0) break
          
          allNews = [...allNews, ...pageNews]
          page++
        }
        
        // 현재 기사 제외
        allNews = allNews.filter(item => item.id !== currentNewsId)
        
        // 1. 같은 티커가 있는 기사 찾기
        const sameTicker = allNews.filter(item => 
          item.tickers && item.tickers.some(t => tickers.includes(t))
        )
        
        // 2. 제목 유사도 기반 추천 (간단한 단어 매칭)
        const titleWords = new Set(
          title.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2) // 3글자 이상만
        )
        
        const similarTitle = allNews.filter(item => {
          const itemWords = item.title.toLowerCase().split(/\s+/)
          const matches = itemWords.filter(word => titleWords.has(word))
          return matches.length >= 2 // 2개 이상 공통 단어
        })
        
        // 중복 제거 및 정렬
        const combined = [...sameTicker, ...similarTitle]
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values())
        
        // 최대 6개만
        setRelatedNews(unique.slice(0, 6))
      } catch (error) {
        console.error('Failed to fetch related news:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (tickers && tickers.length > 0) {
      fetchRelatedNews()
    } else {
      setLoading(false)
    }
  }, [currentNewsId, tickers, title])
  
  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔗 관련 뉴스
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-16" />
          ))}
        </div>
      </div>
    )
  }
  
  if (relatedNews.length === 0) {
    return null
  }
  
  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🔗 관련 뉴스
      </h3>
      <div className="space-y-3">
        {relatedNews.map(item => (
          <Link
            key={item.id}
            href={`/news/${item.id}`}
            className="block bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {item.source}
                  </span>
                  <span>•</span>
                  <span>{item.date}</span>
                  
                  {item.importance && (
                    <>
                      <span>•</span>
                      <span>
                        {item.importance === 'very_high' && '⭐⭐⭐⭐⭐'}
                        {item.importance === 'high' && '⭐⭐⭐⭐'}
                        {item.importance === 'medium' && '⭐⭐⭐'}
                        {item.importance === 'low' && '⭐⭐'}
                        {item.importance === 'very_low' && '⭐'}
                      </span>
                    </>
                  )}
                </div>
                
                {item.tickers && item.tickers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tickers.slice(0, 3).map(ticker => (
                      <span
                        key={ticker}
                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded"
                      >
                        {ticker}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
