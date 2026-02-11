'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Inquiry = {
  id: string
  email: string
  subject: string
  content: string
  status: 'pending' | 'resolved'
  created_at: string
}

export default function InquiryList({ inquiries: initialInquiries }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all')

  const updateStatus = async (id: string, status: 'pending' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      setInquiries(inquiries.map(inq => 
        inq.id === id ? { ...inq, status } : inq
      ))
    } catch (err) {
      console.error('상태 업데이트 실패:', err)
      alert('상태 업데이트에 실패했습니다.')
    }
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id)

      if (error) throw error

      setInquiries(inquiries.filter(inq => inq.id !== id))
    } catch (err) {
      console.error('삭제 실패:', err)
      alert('삭제에 실패했습니다.')
    }
  }

  const filteredInquiries = inquiries.filter(inq => {
    if (filter === 'all') return true
    return inq.status === filter
  })

  const pendingCount = inquiries.filter(inq => inq.status === 'pending').length
  const resolvedCount = inquiries.filter(inq => inq.status === 'resolved').length

  return (
    <div>
      {/* 필터 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          전체 ({inquiries.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          대기 중 ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'resolved'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          완료 ({resolvedCount})
        </button>
      </div>

      {/* 문의 목록 */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">문의사항이 없습니다.</p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {inquiry.subject}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        inquiry.status === 'pending'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {inquiry.status === 'pending' ? '대기 중' : '완료'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>📧 {inquiry.email}</span>
                    <span>•</span>
                    <span>{new Date(inquiry.created_at).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
              </div>

              {/* 내용 */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {inquiry.content}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                {inquiry.status === 'pending' ? (
                  <button
                    onClick={() => updateStatus(inquiry.id, 'resolved')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    ✅ 완료 처리
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(inquiry.id, 'pending')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    ↩️ 대기로 변경
                  </button>
                )}
                <button
                  onClick={() => deleteInquiry(inquiry.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
