'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  views: number;
  likes: number;
  comments: any[];
  created_at: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const response = await fetch('/api/community/posts');
      const data = await response.json();
      setPosts(data);
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
            <Link
              href="/community/write"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              글쓰기
            </Link>
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
                  <div
                    key={post.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {/* 작성자 아이콘 */}
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {post.author[0].toUpperCase()}
                      </div>

                      {/* 게시글 정보 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{post.author}</span>
                          <span>·</span>
                          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                          <span>·</span>
                          <span>조회 {post.views}</span>
                          <span>·</span>
                          <span>댓글 {post.comments.length}</span>
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
