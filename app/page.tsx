import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'
import InstallButton from './InstallButton'
import AdSense from './AdSense'
import AuthButton from './AuthButton'
import LiveNewsUpdater from './LiveNewsUpdater'
import EventsScroll from './EventsScroll'
import EventsSidebar from './EventsSidebar'
import NewsListClient from './components/NewsListClient'
import { getAllNewsStats } from '@/lib/getNewsStats'

// ISR: 60초마다 재생성 (빠른 로딩 + 최신 데이터)
export const revalidate = 60

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
    <div className="min-h-screen bg-gray-50">
      {/* 실시간 업데이트 */}
      <LiveNewsUpdater initialNewsIds={newsIds} />
      
      {/* 설치 버튼 */}
      <InstallButton />
      
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* 상단: 로고 + 탭 + 버튼들 */}
          <div className="flex items-center justify-between py-3">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2 select-none">
              <img src="/logo.png" alt="StockHub" className="h-8 w-auto pointer-events-none" draggable="false" />
              <span className="text-xs text-gray-500 hidden sm:inline">실시간 투자·경제 뉴스</span>
            </Link>
            
            {/* 탭 메뉴 (중앙) */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm"
              >
                📰 뉴스
              </Link>
              <Link
                href="/events"
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
              >
                📅 일정
              </Link>
              <Link
                href="/community"
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
              >
                💬 커뮤니티
              </Link>
              <Link
                href="/notice"
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
              >
                📢 공지
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
              >
                📨 문의
              </Link>
            </nav>
            
            {/* 우측 버튼들 */}
            <div className="flex items-center gap-2">
              {/* 검색 아이콘 */}
              <Link
                href="/search"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="검색"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              
              <a
                href="https://t.me/stockhubkr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.942 13.5l-2.906-.907c-.63-.196-.642-.63.135-.931l11.36-4.38c.525-.195.984.127.814.939z"/>
                </svg>
                <span className="hidden sm:inline">텔레그램</span>
              </a>
              <AuthButton />
            </div>
          </div>
          
          {/* 모바일 탭 메뉴 */}
          <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 -mx-4 px-4">
            <Link href="/" className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm whitespace-nowrap">
              📰 뉴스
            </Link>
            <Link href="/events" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm whitespace-nowrap">
              📅 일정
            </Link>
            <Link href="/community" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm whitespace-nowrap">
              💬 커뮤니티
            </Link>
            <Link href="/notice" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm whitespace-nowrap">
              📢 공지
            </Link>
            <Link href="/contact" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm whitespace-nowrap">
              📨 문의
            </Link>
          </nav>
        </div>
      </header>

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
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <div className="mb-4">
          <a
            href="https://t.me/stockhubkr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
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
