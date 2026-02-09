'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from '../AuthButton'
import BookmarkButton from '../BookmarkButton'

export default function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
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
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/') && pathname === '/'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors`}
            >
              📰 뉴스
            </Link>
            <Link
              href="/community"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/community')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors`}
            >
              💬 커뮤니티
            </Link>
            <Link
              href="/events"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/events')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors`}
            >
              📅 이벤트
            </Link>
            <Link
              href="/notice"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/notice')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors`}
            >
              📢 공지
            </Link>
            <Link
              href="/contact"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/contact')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors`}
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
            <BookmarkButton />
          </div>
        </div>
        
        {/* 모바일 탭 메뉴 */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 -mx-4 px-4">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/') && pathname === '/'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📰 뉴스
          </Link>
          <Link
            href="/community"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/community')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💬 커뮤니티
          </Link>
          <Link
            href="/events"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/events')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📅 이벤트
          </Link>
          <Link
            href="/notice"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/notice')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📢 공지
          </Link>
          <Link
            href="/contact"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/contact')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📨 문의
          </Link>
        </nav>
      </div>
    </header>
  )
}
