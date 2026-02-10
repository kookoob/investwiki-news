'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WritePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          author: form.author.trim() || '익명',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();
      router.push(`/community`);
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/community" className="text-2xl font-bold">
            🔥 글쓰기
          </Link>
          <Link
            href="/community"
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

          {/* 닉네임 (선택) */}
          <div className="mb-4">
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="닉네임 (선택, 비워두면 익명)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              maxLength={20}
            />
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-[300px] resize-y"
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
              {loading ? '작성 중...' : '글 작성'}
            </button>
            <Link
              href="/community"
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
