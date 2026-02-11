'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { validatePassword, validateEmail, checkServerRateLimit } from '@/lib/security'
import { ensureUserExists } from '@/lib/ensureUser'

interface LoginModalProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginModal({ show, onClose, onSuccess }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  if (!show) return null

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 서버 사이드 Rate limiting 체크
    const rateLimitCheck = await checkServerRateLimit(`signup-${email}`, 3, 300000) // 5분에 3번
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.retryAfter 
        ? `너무 많은 시도입니다. ${rateLimitCheck.retryAfter}초 후 다시 시도해주세요.`
        : '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
      return
    }

    // 이메일 형식 검증
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다')
      setLoading(false)
      return
    }

    // 비밀번호 강도 검증
    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) {
      setError(passwordCheck.message)
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: 'https://stockhub.kr/'
      }
    })

    if (error) {
      setError(error.message)
    } else {
      // users 테이블 확인 및 생성
      if (data.user) {
        await ensureUserExists(data.user)
      }
      alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
      onClose()
      onSuccess?.()
    }
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 서버 사이드 Rate limiting 체크 (무차별 대입 공격 방어)
    const rateLimitCheck = await checkServerRateLimit(`signin-${email}`, 5, 300000) // 5분에 5번
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.retryAfter 
        ? `너무 많은 로그인 시도입니다. ${rateLimitCheck.retryAfter}초 후 다시 시도해주세요.`
        : '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다')
    } else {
      // users 테이블 확인 및 생성
      if (data.user) {
        await ensureUserExists(data.user)
      }
      onClose()
      onSuccess?.()
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://stockhub.kr/'
      }
    })
  }

  const handleTwitterLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: 'https://stockhub.kr/'
      }
    })
  }

  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'https://stockhub.kr/'
      }
    })
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 이메일 형식 검증
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://stockhub.kr/reset-password'
      })

      if (error) {
        setError('비밀번호 재설정 이메일 발송에 실패했습니다')
      } else {
        setResetSent(true)
        setError('')
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {isResetMode ? '비밀번호 찾기' : isSignUp ? '회원가입' : '로그인'}
          </h2>
          <button
            onClick={() => {
              setIsResetMode(false)
              setResetSent(false)
              setError('')
              onClose()
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* 비밀번호 재설정 모드 */}
        {isResetMode ? (
          <div>
            {resetSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm">
                  ✅ 비밀번호 재설정 이메일이 발송되었습니다.<br />
                  이메일을 확인하여 비밀번호를 재설정하세요.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>
            )}

            {!resetSent && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '전송 중...' : '재설정 링크 보내기'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setIsResetMode(false)
                setResetSent(false)
                setError('')
              }}
              className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              ← 로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* 소셜 로그인 */}
            <div className="space-y-3">
              {/* Google 로그인 */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>

              {/* 카카오 로그인 */}
              <button
                type="button"
                onClick={handleKakaoLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] hover:bg-[#FDD835] rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12 3C6.5 3 2 6.58 2 11c0 2.95 2.1 5.5 5.25 6.75L6 22l5.25-3.5c.25 0 .5.05.75.05 5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
                </svg>
                카카오로 계속하기
              </button>

              {/* X(트위터) 로그인 */}
              <button
                type="button"
                onClick={handleTwitterLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X로 계속하기
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '처리중...' : (isSignUp ? '회원가입' : '로그인')}
          </button>

          {/* 비밀번호 찾기 링크 */}
          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true)
                  setError('')
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          {' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? '로그인' : '회원가입'}
          </button>
        </p>
          </>
        )}
      </div>
    </div>
  )
}
