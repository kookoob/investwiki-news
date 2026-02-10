'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [postId, setPostId] = useState<string>('');
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    params.then(p => {
      setPostId(p.id);
      checkUser();
      fetchPost(p.id);
    });
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchPost(id: string) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // 권한 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== data.user_id) {
        alert('수정 권한이 없습니다.');
        router.push('/community');
        return;
      }

      setForm({
        title: data.title,
        content: data.content,
      });
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('게시글을 불러올 수 없습니다.');
      router.push('/community');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: form.title.trim(),
          content: form.content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (error) throw error;

      router.push(`/community/${postId}`);
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      setError('게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/community/${postId}`} className="text-2xl font-bold">
            🔥 글 수정
          </Link>
          <Link
            href={`/community/${postId}`}
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
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {submitting ? '수정 중...' : '수정 완료'}
            </button>
            <Link
              href={`/community/${postId}`}
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
