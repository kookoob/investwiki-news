'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


// 관리자 이메일 목록
const ADMIN_EMAILS = ['kyongg02@gmail.com'];

export default function NoticeWritePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
    pinned: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const savedUser = localStorage.getItem('stockhub_user');
      
      if (!savedUser) {
        router.push('/notice');
        return;
      }

      const userData = JSON.parse(savedUser);
      setUser(userData);

      // 사용자 이메일 확인
      const { data } = await supabase
        .from('users')
        .select('email')
        .eq('id', userData.id)
        .single();

      if (data && ADMIN_EMAILS.includes(data.email)) {
        setIsAdmin(true);
      } else {
        alert('관리자만 접근할 수 있습니다.');
        router.push('/notice');
      }
    } catch (error) {
      console.error('권한 확인 실패:', error);
      router.push('/notice');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      setError('관리자만 공지사항을 작성할 수 있습니다.');
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('notices')
        .insert([
          {
            title: form.title.trim(),
            content: form.content.trim(),
            pinned: form.pinned,
          },
        ]);

      if (error) throw error;

      alert('공지사항이 등록되었습니다.');
      router.push('/notice');
    } catch (err) {
      console.error('공지사항 작성 실패:', err);
      setError('공지사항 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">📢 공지사항 작성</h1>
            <Link
              href="/notice"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              취소
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* 관리자 표시 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="font-semibold">👑 관리자 모드</span>
            </div>
          </div>

          {/* 상단 고정 */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-900 font-medium">상단 고정</span>
            </label>
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors"
              maxLength={100}
              required
            />
          </div>

          {/* 내용 */}
          <div className="mb-6">
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="내용을 입력하세요"
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
              required
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? '등록 중...' : '공지사항 등록'}
          </button>
        </form>
      </main>
    </div>
  );
}
