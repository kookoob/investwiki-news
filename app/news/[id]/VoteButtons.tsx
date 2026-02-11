'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import LoginModal from '@/app/LoginModal'
import { awardPoints, POINT_REWARDS } from '@/lib/points'

interface VoteButtonsProps {
  newsId: string
}

export default function VoteButtons({ newsId }: VoteButtonsProps) {
  const [user, setUser] = useState<User | null>(null)
  const [bullishCount, setBullishCount] = useState(0)
  const [bearishCount, setBearishCount] = useState(0)
  const [userVote, setUserVote] = useState<'bullish' | 'bearish' | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // 투표 결과 로드
    loadVotes()

    // 실시간 투표 업데이트
    const channel = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `news_id=eq.${newsId}`
        },
        () => {
          loadVotes()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [newsId])

  const loadVotes = async () => {
    // 전체 투표 수 조회
    const { data: allVotes } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('news_id', newsId)

    if (allVotes) {
      setBullishCount(allVotes.filter(v => v.vote_type === 'bullish').length)
      setBearishCount(allVotes.filter(v => v.vote_type === 'bearish').length)
    }

    // 사용자 투표 조회
    if (user) {
      const { data: myVote } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('news_id', newsId)
        .eq('user_id', user.id)
        .single()

      setUserVote(myVote?.vote_type || null)
    }
  }

  const handleVote = async (voteType: 'bullish' | 'bearish') => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    setLoading(true)

    // 기존 투표 삭제 (재투표)
    if (userVote) {
      await supabase
        .from('votes')
        .delete()
        .eq('news_id', newsId)
        .eq('user_id', user.id)
    }

    // 같은 버튼 클릭 시 투표 취소
    if (userVote === voteType) {
      setUserVote(null)
      setLoading(false)
      loadVotes()
      return
    }

    // 새 투표 등록
    const { error } = await supabase.from('votes').insert({
      news_id: newsId,
      user_id: user.id,
      vote_type: voteType
    })

    setLoading(false)

    if (!error) {
      // 포인트 지급 (첫 투표일 때만)
      if (!userVote) {
        try {
          await awardPoints(user.id, POINT_REWARDS.NEWS_VOTE, '뉴스 투표 참여');
        } catch (pointErr) {
          console.error('포인트 지급 실패:', pointErr);
        }
      }
      
      setUserVote(voteType)
      loadVotes()
    }
  }

  const totalVotes = bullishCount + bearishCount
  const bullishPercent = totalVotes > 0 ? (bullishCount / totalVotes) * 100 : 0
  const bearishPercent = totalVotes > 0 ? (bearishCount / totalVotes) * 100 : 0

  return (
    <>
      <LoginModal 
        show={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => loadVotes()}
      />

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📊 호재/악재 투표
        </h3>

      <div className="flex gap-3 mb-4">
        {/* 호재 버튼 */}
        <button
          onClick={() => handleVote('bullish')}
          disabled={loading}
          className={`flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-lg font-medium transition-all disabled:opacity-50 ${
            userVote === 'bullish'
              ? 'bg-green-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-700 border-2 border-green-500 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-600'
          }`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-sm">호재</span>
          <span className="text-lg font-bold">{bullishCount}</span>
        </button>

        {/* 악재 버튼 */}
        <button
          onClick={() => handleVote('bearish')}
          disabled={loading}
          className={`flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-lg font-medium transition-all disabled:opacity-50 ${
            userVote === 'bearish'
              ? 'bg-red-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-700 border-2 border-red-500 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600'
          }`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span className="text-sm">악재</span>
          <span className="text-lg font-bold">{bearishCount}</span>
        </button>
      </div>

      {/* 투표 결과 바 */}
      {totalVotes > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium w-12">호재</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 dark:bg-green-400 h-full transition-all duration-500"
                style={{ width: `${bullishPercent}%` }}
              />
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium w-12 text-right">
              {bullishPercent.toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-600 dark:text-red-400 font-medium w-12">악재</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 dark:bg-red-400 h-full transition-all duration-500"
                style={{ width: `${bearishPercent}%` }}
              />
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium w-12 text-right">
              {bearishPercent.toFixed(0)}%
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            총 {totalVotes}명이 투표했습니다
          </p>
        </div>
      )}

      {totalVotes === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          첫 투표를 해보세요!
        </p>
      )}
      </div>
    </>
  )
}
