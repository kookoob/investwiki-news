'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import LoginModal from '@/app/LoginModal'
import { awardPoints, POINT_REWARDS } from '@/lib/points'

interface Comment {
  id: string
  user_email: string
  user_name: string | null
  content: string
  created_at: string
  user_id: string
}

export default function Comments({ newsId }: { newsId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [content, setContent] = useState('')
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

    // 댓글 로드
    loadComments()

    // 실시간 댓글 업데이트
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `news_id=eq.${newsId}`
        },
        () => {
          loadComments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [newsId])

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('news_id', newsId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setComments(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!content.trim()) return

    setLoading(true)

    const { error } = await supabase.from('comments').insert({
      news_id: newsId,
      user_id: user.id,
      user_email: user.email!,
      user_name: user.user_metadata?.name || user.email?.split('@')[0],
      content: content.trim()
    })

    setLoading(false)

    if (!error) {
      // 포인트 지급 (댓글 작성: 1포인트)
      await awardPoints(user.id, POINT_REWARDS.COMMENT, '뉴스 댓글 작성');
      
      setContent('')
      loadComments()
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    await supabase.from('comments').delete().eq('id', commentId)
    loadComments()
  }

  return (
    <>
      <LoginModal 
        show={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => loadComments()}
      />

      <div className="mt-8 border-t border-gray-200 pt-8">
        <h3 className="text-xl font-bold mb-6">
          💬 댓글 {comments.length}개
        </h3>

        {/* 댓글 작성 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={() => !user && setShowLoginModal(true)}
            placeholder={user ? "댓글을 입력하세요..." : "댓글을 작성하려면 클릭하세요"}
            readOnly={!user}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none cursor-pointer"
          />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!user || loading || !content.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900">
                    {comment.user_name || '익명'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(comment.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {user && user.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
      </div>
    </>
  )
}
