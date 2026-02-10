'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';


interface BookmarkButtonProps {
  itemId: string;
  itemType: 'news' | 'post';
  size?: 'sm' | 'md' | 'lg';
}

export default function BookmarkButton({ itemId, itemType, size = 'md' }: BookmarkButtonProps) {
  // 임시로 북마크 기능 비활성화 (Supabase 관계 설정 문제)
  return null;
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          await checkBookmark(user.id);
        }
      } catch (err) {
        console.error('북마크 사용자 로드 실패:', err);
      }
    }
    loadUser();
    
    // 로그인 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkBookmark(session.user.id).catch(console.error);
      } else {
        setUser(null);
        setIsBookmarked(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [itemId, itemType]);

  async function checkBookmark(userId: string) {
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      setIsBookmarked(!!data);
    } catch (error) {
      // 북마크 없음
    }
  }

  async function toggleBookmark() {
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    setLoading(true);

    try {
      if (isBookmarked) {
        // 북마크 제거
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        setIsBookmarked(false);
      } else {
        // 북마크 추가
        await supabase
          .from('bookmarks')
          .insert([
            {
              user_id: user.id,
              item_type: itemType,
              item_id: itemId,
            },
          ]);

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('북마크 토글 실패:', error);
      alert('북마크 처리에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={loading}
      className={`transition-colors ${loading ? 'opacity-50' : 'hover:scale-110'}`}
      title={isBookmarked ? '북마크 제거' : '북마크 추가'}
    >
      <svg
        className={`${sizeClasses[size]} transition-colors ${
          isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'fill-none text-gray-400'
        }`}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
