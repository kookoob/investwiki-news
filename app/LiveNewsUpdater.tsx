'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface NewsItem {
  id: string
  title: string
  source: string
  date: string
}

export default function LiveNewsUpdater({ initialNewsIds }: { initialNewsIds: string[] }) {
  const [latestNewsIds, setLatestNewsIds] = useState<string[]>(initialNewsIds)
  const [newNews, setNewNews] = useState<NewsItem[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 알림 사운드 생성 (간단한 비프음)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const createBeep = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800 // 주파수
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }

    // 30초마다 새 뉴스 체크
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/news.json')
        const newsData: NewsItem[] = await response.json()
        
        if (newsData.length === 0) return
        
        // 최신 뉴스 ID
        const latestId = newsData[0].id
        
        // 새 뉴스 확인
        if (!latestNewsIds.includes(latestId)) {
          // 새로운 뉴스들 찾기
          const newItems: NewsItem[] = []
          for (const item of newsData) {
            if (latestNewsIds.includes(item.id)) break
            newItems.push(item)
          }
          
          if (newItems.length > 0) {
            // 사운드 재생
            createBeep()
            
            // 새 뉴스 표시
            setNewNews(newItems)
            setLatestNewsIds(newsData.map(item => item.id))
            
            // 3초 후 알림 제거 및 페이지 새로고침
            setTimeout(() => {
              setNewNews([])
              router.refresh()
            }, 3000)
          }
        }
      } catch (error) {
        console.error('뉴스 체크 오류:', error)
      }
    }, 30000) // 30초

    return () => clearInterval(interval)
  }, [latestNewsIds, router])

  if (newNews.length === 0) return null

  return (
    <div className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-blue-600 text-white rounded-lg shadow-2xl p-4 max-w-md w-full animate-slide-down">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold mb-1">
              🔔 새 뉴스 {newNews.length}개
            </p>
            {newNews.map((item, index) => (
              <p key={item.id} className="text-sm opacity-90 truncate">
                {index + 1}. {item.title}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
