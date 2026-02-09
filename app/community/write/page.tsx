'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    if (!form.title.trim() || !form.content.trim() || !form.author.trim()) {
      setError('닉네임, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 임시 user_id 생성 (익명 게시)
      const tempUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: tempUserId,
            title: form.title.trim(),
            content: form.content.trim(),
            category: 'free',
            author_name: form.author.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 경험치 추가 (+10)
      await addExp(user.id, 10, 'post', data.id);

      router.push(`/community/${data.id}`);
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  async function addExp(userId: string, exp: number, reason: string, referenceId: string) {
    try {
      // 경험치 로그 추가
      await supabase.from('exp_logs').insert([
        {
          user_id: userId,
          exp_change: exp,
          reason,
          reference_id: referenceId,
        },
      ]);

      // 레벨 정보 가져오기
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (levelData) {
        const newExp = levelData.exp + exp;
        const expNeeded = calculateExpNeeded(levelData.level);
        
        let newLevel = levelData.level;
        let remainingExp = newExp;

        // 레벨업 체크
        while (remainingExp >= expNeeded) {
          remainingExp -= expNeeded;
          newLevel++;
        }

        await supabase
          .from('user_levels')
          .update({
            level: newLevel,
            exp: remainingExp,
          })
          .eq('user_id', userId);
      } else {
        // 레벨 정보 없으면 생성
        await supabase.from('user_levels').insert([
          {
            user_id: userId,
            level: 1,
            exp,
          },
        ]);
      }
    } catch (error) {
      console.error('경험치 추가 실패:', error);
    }
  }

  function calculateExpNeeded(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level - 1));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">✍️ 글쓰기</h1>
            <Link
              href="/community"
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

          {/* 닉네임 */}
          <div className="mb-6">
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="닉네임 (익명 게시)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              maxLength={20}
              required
            />
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
            {loading ? '작성 중...' : '작성 완료'}
          </button>
        </form>
      </main>
    </div>
  );
}
