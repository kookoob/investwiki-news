'use client'

import { useEffect } from 'react'

export default function NotificationHandler() {
  useEffect(() => {
    // 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // 주기적으로 새 뉴스 체크 (30초마다)
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch('/news.json')
        const news = await response.json()
        
        if (news.length === 0) return
        
        // localStorage에서 마지막 확인한 뉴스 ID
        const lastSeenId = localStorage.getItem('lastSeenNewsId')
        const latestNewsId = news[0].id
        
        // 새 뉴스가 있으면
        if (lastSeenId && lastSeenId !== latestNewsId) {
          // 알림 표시
          if (Notification.permission === 'granted') {
            new Notification('📰 새로운 뉴스!', {
              body: news[0].title,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: 'news-update',
              requireInteraction: false
            })
            
            // 소리 재생
            try {
              const audio = new Audio('/notification.mp3')
              audio.volume = 0.5
              audio.play().catch(() => {
                // 자동재생 차단 시 무시
              })
            } catch (e) {
              // 소리 파일 없으면 무시
            }
          }
          
          // 마지막 본 뉴스 ID 업데이트
          localStorage.setItem('lastSeenNewsId', latestNewsId)
        } else if (!lastSeenId) {
          // 첫 방문이면 현재 최신 뉴스 ID 저장
          localStorage.setItem('lastSeenNewsId', latestNewsId)
        }
      } catch (error) {
        console.error('뉴스 체크 실패:', error)
      }
    }, 30000) // 30초마다

    return () => clearInterval(checkInterval)
  }, [])

  return null
}
