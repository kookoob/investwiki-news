'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ensureUserExists } from '@/lib/ensureUser';
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
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await ensureUserExists(user);
    }
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
            .select('username, display_name, avatar_url')
            .eq('id', post.user_id)
            .maybeSingle();
          
          return { 
            ...post, 
            author_name: userData?.display_name || userData?.username || '익명',
            author_username: userData?.username || '',
            author_avatar: userData?.avatar_url || ''
          };
        } catch (err) {
          console.error('사용자 정보 로딩 실패:', err);
          return { 
            ...post, 
            author_name: '익명',
            author_username: '',
            author_avatar: ''
          };
        }
      }));
      
      setPosts(postsWithUsernames);
      setAllPosts(postsWithUsernames);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setPosts(allPosts);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = allPosts.filter((post: any) => {
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.author_name.toLowerCase().includes(searchLower)
      );
    });

    setPosts(filtered);
  }

  function clearSearch() {
    setSearchQuery('');
    setPosts(allPosts);
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">커뮤니티</h1>
            {user ? (
              <Link
                href="/community/write"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                글쓰기
              </Link>
            ) : (
              <div className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">
                로그인 후 글쓰기 가능
              </div>
            )}
          </div>

          {/* 검색창 */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 내용, 작성자로 검색..."
                className="flex-1 px-4 py-2 bg-white dark:bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                검색
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  초기화
                </button>
              )}
            </form>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">
                "{searchQuery}" 검색 결과: {posts.length}개
              </p>
            )}
          </div>

          {/* 게시글 목록 */}
          <div className="bg-white dark:bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 dark:text-gray-400">로딩 중...</div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 dark:text-gray-400">
                아직 게시글이 없습니다. 첫 글을 작성해보세요!
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* 프로필 이미지 - 클릭 가능 */}
                      <Link
                        href={`/profile/${post.user_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                      >
                        {(post as any).author_avatar ? (
                          <img
                            src={(post as any).author_avatar}
                            alt={(post as any).author_name || '익명'}
                            className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm hover:ring-2 hover:ring-blue-400 transition-all">
                            {((post as any).author_name || '익명')[0].toUpperCase()}
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* 닉네임 - 클릭 가능 */}
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/profile/${post.user_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-400 transition-colors"
                          >
                            {(post as any).author_name || '익명'}
                          </Link>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            @{(post as any).author_username || 'unknown'}
                          </span>
                        </div>

                        {/* 게시글 제목 - 클릭 시 상세 페이지 */}
                        <Link href={`/community/${post.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-blue-400 transition-colors">
                            {post.title}
                          </h3>
                        </Link>

                        <Link href={`/community/${post.id}`}>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                            {post.content}
                          </p>
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
                          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                          <span>·</span>
                          <span>조회 {post.views}</span>
                          <span>·</span>
                          <span>좋아요 {post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
