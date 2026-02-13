import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'
import InstallButton from './InstallButton'
import AdSense from './AdSense'
import Header from './components/Header'
import LiveNewsUpdater from './LiveNewsUpdater'
import EventsScroll from './EventsScroll'
import EventsSidebar from './EventsSidebar'
import NewsListClient from './components/NewsListClient'
import { getAllNewsStats } from '@/lib/getNewsStats'

// ISR: 30초마다 재생성 (빠른 로딩 + 최신 데이터)
export const revalidate = 30

async function getNews() {
  try {
    // 모든 페이지 파일 읽기
    const allNews = []
    let pageNum = 1
    
    while (true) {
      try {
        const filePath = path.join(process.cwd(), 'public', `news-${pageNum}.json`)
        const fileContents = await fs.readFile(filePath, 'utf8')
        const pageNews = JSON.parse(fileContents)
        allNews.push(...pageNews)
        pageNum++
      } catch {
        // 더 이상 페이지 파일이 없으면 중단
        break
      }
    }
    
    // 전체 뉴스를 timestamp 기준으로 최신순 정렬
    allNews.sort((a: any, b: any) => b.timestamp - a.timestamp)
    
    return allNews
  } catch {
    return []
  }
}

async function getEvents() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'events.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch {
    return []
  }
}

async function getWeeklySummary() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'weekly-summary.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch {
    return null
  }
}

export default async function Home() {
  const news = await getNews()
  const allEvents = await getEvents()
  const weeklySummary = await getWeeklySummary()
  const newsIds = news.map((item: any) => item.id)
  const stats = await getAllNewsStats(newsIds)
  
  // 한국시간(KST) 기준 오늘
  const nowKST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
  nowKST.setHours(0, 0, 0, 0)
  
  // 사이드바용: 오늘 이후만 (한국시간 기준)
  const upcomingEvents = allEvents.filter((event: any) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= nowKST
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // 캘린더 페이지용: 최근 7일 ~ 미래 (한국시간 기준)
  const sevenDaysAgo = new Date(nowKST)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const events = allEvents.filter((event: any) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= sevenDaysAgo
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 실시간 업데이트 */}
      <LiveNewsUpdater initialNewsIds={newsIds} />
      
      {/* 설치 버튼 */}
      <InstallButton />
      
      {/* 헤더 */}
      <Header />

      {/* 모바일 이벤트 스크롤 */}
      <EventsScroll />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* 뉴스 피드 */}
          <NewsListClient initialNews={news} stats={stats} />
          
          {/* PC 사이드바 */}
          <EventsSidebar events={upcomingEvents} weeklySummary={weeklySummary} />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="mb-4">
          <a
            href="https://t.me/stockhubkr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.942 13.5l-2.906-.907c-.63-.196-.642-.63.135-.931l11.36-4.38c.525-.195.984.127.814.939z"/>
            </svg>
            텔레그램 채널 구독하기
          </a>
        </div>
        <p>© 2026 StockHub. Powered by Gemini AI</p>
      </footer>
    </div>
  )
}
