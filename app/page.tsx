import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'
import InstallButton from './InstallButton'
import AdSense from './AdSense'
import AuthButton from './AuthButton'
import LiveNewsUpdater from './LiveNewsUpdater'
import EventsScroll from './EventsScroll'
import EventsSidebar from './EventsSidebar'
import BookmarkButton from './components/BookmarkButton'
import { getAllNewsStats } from '@/lib/getNewsStats'

async function getNews() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'news.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContents)
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

export default async function Home() {
  const news = await getNews()
  const events = await getEvents()
  const newsIds = news.map((item: any) => item.id)
  const stats = await getAllNewsStats(newsIds)

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
                href="/community"
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
              >
                💬 커뮤니티
              </Link>
              <Link
                href="/events"
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
              >
                📅 이벤트
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
            <Link href="/community" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm whitespace-nowrap">
              💬 커뮤니티
            </Link>
            <Link href="/events" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm whitespace-nowrap">
              📅 이벤트
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
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="md:grid md:grid-cols-[minmax(0,800px),320px] md:gap-6 md:justify-center">
          {/* 뉴스 피드 */}
          <div className="space-y-4">
            {news.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                뉴스를 불러오는 중...
              </div>
            )}
            
            {news.map((item: any, index: number) => {
          const itemStats = stats[item.id] || { bullish: 0, bearish: 0, comments: 0 }
          
          return (
          <div key={item.id}>
            <Link href={`/news/${item.id}`} className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-4">
              <div className="flex items-start gap-2 mb-2">
                <h2 className="flex-1 text-lg font-semibold text-gray-900 line-clamp-2">
                  {item.title}
                </h2>
                <BookmarkButton itemId={item.id} itemType="news" size="md" />
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                <span className="font-medium text-blue-600">{item.source}</span>
                <span>•</span>
                <span>{item.date}</span>
                
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
            {/* 5번째 뉴스 뒤에 광고 */}
            {index === 4 && <AdSense slot="1234567890" />}
          </div>
          )
        })}
          </div>
          
          {/* PC 사이드바 */}
          <EventsSidebar events={events} />
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
