'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserProfile {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
}

interface UserLevel {
  level: number;
  exp: number;
  season: number;
}

interface UserStats {
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [stats, setStats] = useState<UserStats>({ postsCount: 0, commentsCount: 0, likesReceived: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      // localStorage에서 사용자 정보 가져오기
      const savedUser = localStorage.getItem('stockhub_user');
      
      if (!savedUser) {
        router.push('/community');
        return;
      }

      const userData = JSON.parse(savedUser);
      setUser(userData);
      await fetchProfile(userData.id);
      await fetchLevel(userData.id);
      await fetchStats(userData.id);
    } catch (error) {
      console.error('사용자 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data ? {
        username: data.username || '',
        display_name: data.username || '',
        bio: '',
        avatar_url: ''
      } : { username: '', display_name: '', bio: '', avatar_url: '' });
    } catch (error) {
      console.error('프로필 로딩 실패:', error);
    }
  }

  async function fetchLevel(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setLevel(data || { level: 1, exp: 0, season: 1 });
    } catch (error) {
      console.error('레벨 로딩 실패:', error);
    }
  }

  async function fetchStats(userId: string) {
    try {
      // 작성한 글 수
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // 작성한 댓글 수
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // 받은 좋아요 수 (게시글 + 댓글)
      const { data: posts } = await supabase
        .from('posts')
        .select('likes')
        .eq('user_id', userId)
        .is('deleted_at', null);

      const { data: comments } = await supabase
        .from('post_comments')
        .select('likes')
        .eq('user_id', userId)
        .is('deleted_at', null);

      const likesReceived = 
        (posts || []).reduce((sum, p) => sum + p.likes, 0) +
        (comments || []).reduce((sum, c) => sum + c.likes, 0);

      setStats({
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        likesReceived,
      });
    } catch (error) {
      console.error('통계 로딩 실패:', error);
    }
  }

  function calculateExpNeeded(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level - 1));
  }

  function calculateProgress(): number {
    if (!level) return 0;
    const needed = calculateExpNeeded(level.level);
    return Math.min((level.exp / needed) * 100, 100);
  }

  async function handleLogout() {
    localStorage.removeItem('stockhub_user');
    router.push('/community');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">프로필</h1>
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              ← 홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
          {/* 아바타 */}
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profile?.display_name?.[0] || profile?.username?.[0] || '?'}
          </div>

          {/* 뱃지 */}
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
            브론즈
          </div>

          {/* 이름 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {profile?.display_name || profile?.username || '익명'}
          </h2>
          <p className="text-gray-600 mb-4">{user?.email}</p>

          {/* 레벨 프로그레스 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-600 font-semibold">현재 {level?.exp || 0} 포인트</span>
              <span className="text-gray-600">다음 레벨까지 {calculateExpNeeded(level?.level || 1)}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.postsCount}</p>
              <p className="text-sm text-gray-600">작성한 글</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.likesReceived}</p>
              <p className="text-sm text-gray-600">받은 좋아요</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">저장한 글</p>
            </div>
          </div>
        </div>

        {/* 설정 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <h3 className="px-6 py-4 font-bold text-gray-900 border-b border-gray-200">설정</h3>
          
          {/* 일반 설정 */}
          <Link
            href="/profile/edit"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">일반 설정</p>
                <p className="text-sm text-gray-500">관심 태그 관리 관리</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* 회원 정보 수정 */}
          <Link
            href="/profile/account"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">회원 정보 수정</p>
                <p className="text-sm text-gray-500">프로필 수정 관리</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* 앱 화면 설정 */}
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">앱 화면 설정</p>
                <p className="text-sm text-gray-500">알림 테마 관리</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* 문의하기 */}
          <Link
            href="/contact"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">문의하기</p>
                <p className="text-sm text-gray-500">StockHub에 의견 남기기</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 활동 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <h3 className="px-6 py-4 font-bold text-gray-900 border-b border-gray-200">활동</h3>
          
          <Link
            href="/profile/posts"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">내가 쓴 글</p>
                <p className="text-sm text-gray-500">작성한 게시물 관리</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">저장한 글</p>
                <p className="text-sm text-gray-500">북마크한 게시물 관리</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-lg border border-gray-200 px-6 py-4 text-center text-red-600 font-medium hover:bg-red-50 transition-colors"
        >
          로그아웃
        </button>

        {/* 회원 탈퇴 */}
        <div className="text-center py-4">
          <button className="text-sm text-gray-400 hover:text-gray-600 underline">
            회원 탈퇴
          </button>
        </div>

        {/* 푸터 링크 */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 py-4">
          <Link href="/notice" className="hover:text-gray-700">이용약관</Link>
          <span>•</span>
          <Link href="/notice" className="hover:text-gray-700">개인정보처리방침</Link>
          <span>•</span>
          <Link href="/notice" className="hover:text-gray-700">뉴스운영정책</Link>
        </div>
      </main>
    </div>
  );
}
