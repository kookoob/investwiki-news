'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthButton from '../AuthButton'
import MarketTicker from './MarketTicker'

export default function Header() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('stockhub_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setIsAdmin(userData.email === 'kyongg02@gmail.com')
    }
    
    // 다크모드 초기화 (시스템 설정 또는 저장된 설정)
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])
  
  const toggleDarkMode = () => {
    const newDarkState = !isDark
    setIsDark(newDarkState)
    
    if (newDarkState) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* 상단: 로고 + 탭 + 버튼들 */}
        <div className="flex items-center justify-between py-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 select-none">
            <img src="/logo.png?v=6" alt="StockHub" className="h-10 sm:h-12 md:h-14 w-auto pointer-events-none" draggable="false" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline font-medium">실시간 투자·경제 뉴스</span>
          </Link>
          
          {/* 탭 메뉴 (중앙) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/') && pathname === '/'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              } transition-colors`}
            >
              📰 뉴스
            </Link>
            <Link
              href="/events"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/events')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              } transition-colors`}
            >
              📅 일정
            </Link>
            <Link
              href="/markets"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/markets')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              } transition-colors`}
            >
              📊 시장
            </Link>
            <Link
              href="/community"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/community')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              } transition-colors`}
            >
              💬 커뮤니티
            </Link>
            <Link
              href="/notice"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/notice')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              } transition-colors`}
            >
              📢 공지
            </Link>
            <Link
              href="/contact"
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                isActive('/contact')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              } transition-colors`}
            >
              📨 문의
            </Link>
            {isAdmin && (
              <Link
                href="/admin/inquiries"
                className={`px-3 py-2 rounded-lg font-medium text-sm ${
                  isActive('/admin')
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                } transition-colors`}
              >
                🔧 관리자
              </Link>
            )}
          </nav>
          
          {/* 우측 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 다크모드 토글 */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* 검색 아이콘 */}
            <Link
              href="/search"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/search')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="검색"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            
            {/* 텔레그램 버튼 */}
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
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/') && pathname === '/'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            📰 뉴스
          </Link>
          <Link
            href="/events"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/events')
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            📅 일정
          </Link>
          <Link
            href="/markets"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/markets')
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            📊 시장
          </Link>
          <Link
            href="/community"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/community')
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            💬 커뮤니티
          </Link>
          <Link
            href="/notice"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/notice')
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            📢 공지
          </Link>
          <Link
            href="/contact"
            className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              isActive('/contact')
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            📨 문의
          </Link>
          {isAdmin && (
            <Link
              href="/admin/inquiries"
              className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                isActive('/admin')
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
              }`}
            >
              🔧 관리자
            </Link>
          )}
        </nav>
      </div>
      
      {/* 시장 지수 티커 */}
      <MarketTicker />
    </header>
  )
}
