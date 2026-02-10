'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Header from '@/app/components/Header';
import type { User } from '@supabase/supabase-js';
import { awardPoints, POINT_REWARDS } from '@/lib/points';

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  views: number;
  likes: number;
  created_at: string;
}

interface PostLike {
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [postId, setPostId] = useState<string>('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    params.then(p => {
      setPostId(p.id);
      fetchPost(p.id);
      fetchComments(p.id);
      fetchLikes(p.id);
    });
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchPost(id: string) {
    try {
      // posts 먼저 가져오기
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postError) throw postError;
      
      // 작성자 정보 별도로 가져오기
      let authorName = '익명';
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', postData.user_id)
          .maybeSingle();
        
        if (userData?.username) {
          authorName = userData.username;
        }
      } catch (err) {
        console.error('작성자 정보 로딩 실패:', err);
      }
      
      // 닉네임 정보 추가
      const postWithUsername = {
        ...postData,
        author_name: authorName
      };
      
      setPost(postWithUsername as any);

      // 조회수 증가 (간단 버전)
      await supabase
        .from('posts')
        .update({ views: (postData.views || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments(id: string) {
    try {
      // 댓글 먼저 가져오기
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      // 각 댓글의 작성자 정보 가져오기
      const commentsWithUsernames = await Promise.all((commentsData || []).map(async (comment: any) => {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', comment.user_id)
            .maybeSingle();
          
          return {
            ...comment,
            author_name: userData?.username || '익명'
          };
        } catch (err) {
          console.error('댓글 작성자 정보 로딩 실패:', err);
          return {
            ...comment,
            author_name: '익명'
          };
        }
      }));
      
      setComments(commentsWithUsernames);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }

  async function fetchLikes(id: string) {
    try {
      // 좋아요 수
      const { data: likes, error: likesError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', id);

      if (likesError) throw likesError;
      setLikeCount(likes?.length || 0);

      // 현재 사용자가 좋아요 눌렀는지
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userLiked = likes?.some(like => like.user_id === user.id);
        setLiked(userLiked || false);
      }
    } catch (error) {
      console.error('Failed to fetch likes:', error);
    }
  }

  async function toggleLike() {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (liked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postId,
            user_id: user.id,
          }]);

        if (error) throw error;
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: commentText.trim(),
          },
        ]);

      if (error) throw error;

      // 포인트 지급 (댓글 작성: 1포인트)
      try {
        await awardPoints(user.id, POINT_REWARDS.COMMENT, '커뮤니티 댓글 작성');
      } catch (pointErr) {
        console.error('포인트 지급 실패:', pointErr);
        // 포인트 지급 실패해도 댓글 작성은 성공
      }

      setCommentText('');
      fetchComments(postId);
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">게시글을 찾을 수 없습니다</h2>
            <Link href="/community" className="text-blue-600 hover:text-blue-700">
              커뮤니티로 돌아가기
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 뒤로가기 & 작성자 메뉴 */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/community" className="text-blue-600 hover:text-blue-700">
              ← 목록으로
            </Link>
            {user && (user.id === post.user_id || user.email === 'kyongg02@gmail.com') && (
              <div className="flex items-center gap-2">
                {user.id === post.user_id && (
                  <Link
                    href={`/community/${postId}/edit`}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg transition-colors"
                  >
                    수정
                  </Link>
                )}
                <button
                  onClick={async () => {
                    if (!confirm('정말 삭제하시겠습니까?')) return;
                    try {
                      const { error } = await supabase
                        .from('posts')
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', postId);
                      if (error) throw error;
                      alert('삭제되었습니다.');
                      window.location.href = '/community';
                    } catch (error) {
                      console.error('삭제 실패:', error);
                      alert('삭제에 실패했습니다.');
                    }
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded-lg transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {/* 게시글 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {((post as any).author_name || '익명')[0].toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{(post as any).author_name || '익명'}</span>
              </div>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">조회 {post.views}</span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
              {post.content}
            </div>

            {/* 이미지 (있는 경우) */}
            {(post as any).image_url && (
              <div className="mb-6">
                <img
                  src={(post as any).image_url}
                  alt="게시글 이미지"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* 좋아요 버튼 */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  liked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">좋아요 {likeCount}</span>
              </button>
            </div>
          </div>

          {/* 댓글 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              댓글 {comments.length}
            </h2>

            {/* 댓글 목록 */}
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">첫 댓글을 작성해보세요!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {((comment as any).author_name || '익명')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {(comment as any).author_name || '익명'}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* 댓글 작성 */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="border-t border-gray-200 pt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors mb-3 min-h-[100px] resize-y"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? '작성 중...' : '댓글 작성'}
                </button>
              </form>
            ) : (
              <div className="border-t border-gray-200 pt-4 text-center text-gray-500">
                댓글을 작성하려면 로그인하세요
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
