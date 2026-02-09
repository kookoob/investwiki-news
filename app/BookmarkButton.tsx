'use client'

import { useState } from 'react'

export default function BookmarkButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleBookmark = () => {
    // Ctrl+D 안내
    if (typeof window !== 'undefined') {
      const isMac = /Mac/.test(navigator.userAgent)
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D'
      
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
      
      // Chrome/Edge의 즐겨찾기 API 시도
      if ('external' in window && 'AddFavorite' in (window.external as any)) {
        try {
          (window.external as any).AddFavorite(window.location.href, 'InvestWiki 뉴스')
        } catch (e) {
          // IE/Edge Legacy만 지원
        }
      }
    }
  }

  return (
    <div className="hidden md:block relative">
      <button
        onClick={handleBookmark}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        즐겨찾기 추가
      </button>
      
      {showTooltip && (
        <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-50">
          <div className="font-medium mb-1">즐겨찾기에 추가하려면:</div>
          <div>• Windows: <kbd className="bg-gray-700 px-1.5 py-0.5 rounded">Ctrl+D</kbd></div>
          <div>• Mac: <kbd className="bg-gray-700 px-1.5 py-0.5 rounded">Cmd+D</kbd></div>
        </div>
      )}
    </div>
  )
}
