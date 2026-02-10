'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NoticeWritePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
    password: '',
    pinned: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    if (!form.password) {
      setError('관리자 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          password: form.password,
          pinned: form.pinned,
        }),
      });

      if (response.status === 401) {
        setError('비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create notice');
      }

      router.push('/notice');
    } catch (err) {
      console.error('공지사항 작성 실패:', err);
      setError('공지사항 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/notice" className="text-2xl font-bold">
            📢 공지사항 작성
          </Link>
          <Link
            href="/notice"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg transition-colors cursor-pointer"
          >
            취소
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* 관리자 비밀번호 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 비밀번호 *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="관리자 비밀번호"
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* 상단 고정 */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">상단 고정</span>
            </label>
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 text-lg font-medium text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-[300px] resize-y"
              required
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? '작성 중...' : '공지 작성'}
            </button>
            <Link
              href="/notice"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors text-center cursor-pointer"
            >
              취소
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
