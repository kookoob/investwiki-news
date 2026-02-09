'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

const ADMIN_EMAILS = ['kyongg02@gmail.com'];

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchNotices();
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const savedUser = localStorage.getItem('stockhub_user');
      if (!savedUser) return;

      const userData = JSON.parse(savedUser);
      const { data } = await supabase
        .from('users')
        .select('email')
        .eq('id', userData.id)
        .single();

      if (data && ADMIN_EMAILS.includes(data.email)) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('권한 확인 실패:', error);
    }
  }

  async function fetchNotices() {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">📢 공지사항</h1>
            {isAdmin && (
              <a
                href="/notice/write"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ✍️ 작성하기
              </a>
            )}
          </div>
          <p className="text-gray-600">StockHub의 새로운 소식을 확인하세요</p>
        </div>

        {/* 공지사항 리스트 */}
        <div className="max-w-4xl mx-auto space-y-4">
          {notices.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
              <p className="text-white/70">등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border transition-all hover:bg-white/15 ${
                  notice.pinned
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {notice.pinned && (
                    <span className="text-2xl">📌</span>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2">
                      {notice.title}
                    </h2>
                    <p className="text-white/70 mb-4 whitespace-pre-wrap">
                      {notice.content}
                    </p>
                    <p className="text-sm text-white/50">
                      {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 돌아가기 버튼 */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ← 홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
