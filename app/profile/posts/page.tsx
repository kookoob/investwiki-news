'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MyPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    setPosts(data || []);
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
        <h1 className="text-2xl font-bold mb-6">내가 쓴 글 ({posts.length})</h1>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            작성한 글이 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>조회 {post.views}</span>
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
