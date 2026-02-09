'use client'

import { useEffect, useState } from 'react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // 디바이스 감지
    const userAgent = window.navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(userAgent)
    const android = /Android/.test(userAgent)
    
    setIsIOS(ios)
    setIsAndroid(android)

    // 이미 설치되었는지 확인
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    
    // 모바일이고 설치 안 되어 있으면 표시
    if ((ios || android) && !isInstalled) {
      setShowBanner(true)
    }

    // Android PWA 이벤트
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android PWA 설치
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      // iOS 안내
      alert('Safari에서: 하단 공유 버튼(↑) → "홈 화면에 추가"를 선택하세요')
    } else {
      // 일반 안내
      alert('브라우저 메뉴에서 "홈 화면에 추가" 또는 "바로가기 추가"를 선택하세요')
    }
  }

  if (!showBanner) return null

  return (
    <div className="md:hidden bg-blue-600 text-white py-3 px-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <div>
          <div className="font-semibold text-sm">홈 화면에 추가</div>
          <div className="text-xs opacity-90">
            {isIOS ? 'Safari 공유 버튼(↑)에서 추가' : '빠른 접속을 위해 바로가기를 만드세요'}
          </div>
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="bg-white text-blue-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
      >
        {isIOS ? '방법 보기' : '추가하기'}
      </button>
    </div>
  )
}
