'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';


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

interface Comment {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  user_profiles?: {
    username: string;
    display_name: string;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      incrementViews();
    }
  }, [postId]);

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles(username, display_name)
        `)
        .eq('id', postId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user_profiles(username, display_name)
        `)
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  }

  async function incrementViews() {
    try {
      await supabase.rpc('increment_post_views', { post_id: postId });
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      const { data, error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 경험치 추가 (+5)
      await addExp(user.id, 5, 'comment', data.id);

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function addExp(userId: string, exp: number, reason: string, referenceId: string) {
    try {
      await supabase.from('exp_logs').insert([
        {
          user_id: userId,
          exp_change: exp,
          reason,
          reference_id: referenceId,
        },
      ]);

      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (levelData) {
        const newExp = levelData.exp + exp;
        const expNeeded = Math.floor(100 * Math.pow(1.1, levelData.level - 1));
        
        let newLevel = levelData.level;
        let remainingExp = newExp;

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
      }
    } catch (error) {
      console.error('경험치 추가 실패:', error);
    }
  }

  function getTimeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return date.toLocaleDateString('ko-KR');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">게시글을 찾을 수 없습니다.</p>
        <Link href="/community" className="text-blue-600 hover:underline">
          커뮤니티로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/community" className="text-blue-600 hover:underline">
            ← 목록으로
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 게시글 */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          {/* 카테고리 */}
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              자유게시판
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            <span className="font-medium">
              {post.user_profiles?.display_name || post.user_profiles?.username || '익명'}
            </span>
            <span>•</span>
            <span>{getTimeAgo(post.created_at)}</span>
            <span>•</span>
            <span>조회 {post.views}</span>
            <span>•</span>
            <span>좋아요 {post.likes}</span>
          </div>

          {/* 내용 */}
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-800">{post.content}</p>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            💬 댓글 {comments.length}
          </h2>

          {/* 댓글 작성 */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none mb-2"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? '작성 중...' : '댓글 작성'}
            </button>
          </form>

          {/* 댓글 리스트 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">첫 댓글을 작성해보세요!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-t border-gray-200 pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.user_profiles?.display_name || comment.user_profiles?.username || '익명'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap mb-2">{comment.content}</p>
                  <button className="text-sm text-gray-500 hover:text-blue-600">
                    👍 좋아요 {comment.likes}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
