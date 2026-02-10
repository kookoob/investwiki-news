'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Header from '../components/Header';
import type { User } from '@supabase/supabase-js';

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  views: number;
  likes: number;
  created_at: string;
  user_profiles?: {
    username: string;
    display_name: string;
  };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchPosts();
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchPosts() {
    try {
      // posts만 먼저 가져오기
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;
      
      // 각 포스트의 작성자 정보 가져오기
      const postsWithUsernames = await Promise.all((postsData || []).map(async (post: any) => {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', post.user_id)
            .maybeSingle();
          
          return { 
            ...post, 
            author_name: userData?.username || '익명' 
          };
        } catch (err) {
          console.error('사용자 정보 로딩 실패:', err);
          return { ...post, author_name: '익명' };
        }
      }));
      
      setPosts(postsWithUsernames);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
            {user ? (
              <Link
                href="/community/write"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                글쓰기
              </Link>
            ) : (
              <div className="text-sm text-gray-500">
                로그인 후 글쓰기 가능
              </div>
            )}
          </div>

          {/* 게시글 목록 */}
          <div className="bg-white rounded-lg border border-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">로딩 중...</div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                아직 게시글이 없습니다. 첫 글을 작성해보세요!
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/community/${post.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {((post as any).author_name || '익명')[0].toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{(post as any).author_name || '익명'}</span>
                          <span>·</span>
                          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                          <span>·</span>
                          <span>조회 {post.views}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
