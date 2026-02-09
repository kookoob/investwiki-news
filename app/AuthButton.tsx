'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email?: string
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // localStorage에서 사용자 정보 확인
    const savedUser = localStorage.getItem('stockhub_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요')
      return
    }

    setLoading(true)
    
    // 간단한 사용자 정보 생성
    const userData: User = {
      id: `user_${Date.now()}`,
      username: nickname.trim(),
      email: email.trim() || undefined
    }

    // localStorage에 저장
    localStorage.setItem('stockhub_user', JSON.stringify(userData))
    setUser(userData)
    setShowModal(false)
    setNickname('')
    setEmail('')
    setLoading(false)
    
    // 페이지 새로고침
    window.location.reload()
  }

  const handleLogout = () => {
    localStorage.removeItem('stockhub_user')
    setUser(null)
    window.location.reload()
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="/profile"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <span className="hidden sm:inline">
            {user.username}
          </span>
        </a>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
      >
        로그인
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">로그인</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임 *
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="사용하실 닉네임을 입력하세요"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 (선택)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="이메일 (선택 입력)"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? '처리 중...' : '시작하기'}
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  )
}
