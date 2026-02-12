// 인증 상태 캐싱으로 Disk IO 절약
import { User } from '@supabase/supabase-js'

const CACHE_KEY = 'stockhub_auth_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5분

interface AuthCache {
  user: User | null
  timestamp: number
}

export function getCachedAuth(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const data: AuthCache = JSON.parse(cached)
    const now = Date.now()
    
    // 5분 이내면 캐시 사용
    if (now - data.timestamp < CACHE_DURATION) {
      return data.user
    }
    
    // 만료된 캐시 삭제
    sessionStorage.removeItem(CACHE_KEY)
  } catch (e) {
    console.error('Auth cache error:', e)
  }
  
  return null
}

export function setCachedAuth(user: User | null) {
  if (typeof window === 'undefined') return
  
  try {
    const cache: AuthCache = {
      user,
      timestamp: Date.now()
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.error('Set auth cache error:', e)
  }
}

export function clearAuthCache() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(CACHE_KEY)
}
