'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  posts: {
    title: string;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
      fetchUserComments();
    }
  }, [userId]);

  async function fetchUserProfile() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('프로필 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    }
  }

  async function fetchUserComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, posts(title)')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false})
        .limit(20);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">로딩 중...</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">사용자를 찾을 수 없습니다</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 프로필 카드 */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-start gap-4">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-gray-400 text-sm mb-3">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-gray-300 mb-3">{profile.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}</span>
                  <span>게시글 {posts.length}개</span>
                  <span>댓글 {comments.length}개</span>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'posts'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              게시글 ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'comments'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              댓글 ({comments.length})
            </button>
          </div>

          {/* 게시글 목록 */}
          {activeTab === 'posts' && (
            <div className="space-y-2">
              {posts.length === 0 ? (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center text-gray-400">
                  작성한 게시글이 없습니다
                </div>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/community/${post.id}`}
                    className="block bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                  >
                    <h3 className="text-white font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(post.created_at)}</span>
                      <span>조회 {post.views}</span>
                      <span>좋아요 {post.likes}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* 댓글 목록 */}
          {activeTab === 'comments' && (
            <div className="space-y-2">
              {comments.length === 0 ? (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center text-gray-400">
                  작성한 댓글이 없습니다
                </div>
              ) : (
                comments.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/community/${comment.post_id}`}
                    className="block bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="text-sm text-blue-400 mb-2">
                      {comment.posts?.title}
                    </div>
                    <p className="text-gray-300 mb-2">{comment.content}</p>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
