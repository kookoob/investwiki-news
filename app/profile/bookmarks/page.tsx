'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 북마크된 아이템 정보 가져오기
    const items = await Promise.all((data || []).map(async (bm) => {
      if (bm.item_type === 'post') {
        const { data: post } = await supabase
          .from('posts')
          .select('*')
          .eq('id', bm.item_id)
          .single();
        return { ...bm, item: post, type: 'post' };
      } else {
        // 뉴스는 JSON에서 가져오기 (간단히 ID만 표시)
        return { ...bm, item: { id: bm.item_id, title: '뉴스 기사' }, type: 'news' };
      }
    }));

    setBookmarks(items);
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/profile" className="text-blue-600 hover:underline text-sm">← 프로필로</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">저장한 글 ({bookmarks.length})</h1>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            저장한 글이 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bm) => (
              <Link
                key={bm.id}
                href={bm.type === 'post' ? `/community/${bm.item_id}` : `/news/${bm.item_id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 mb-2">
                      {bm.item?.title || '삭제된 글'}
                    </h2>
                    {bm.type === 'post' && bm.item?.content && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{bm.item.content}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{bm.type === 'post' ? '커뮤니티' : '뉴스'}</span>
                      <span>{new Date(bm.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
