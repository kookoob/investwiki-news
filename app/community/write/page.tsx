'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { awardPoints, POINT_REWARDS } from '@/lib/points';

export default function WritePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setAuthLoading(false);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    // 1MB 제한
    if (file.size > 1024 * 1024) {
      alert('이미지 크기는 1MB 이하로 제한됩니다');
      return;
    }

    setImageFile(file);
    
    // 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // users 테이블에 사용자 추가 (없으면)
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          await supabase.from('users').insert([{
            id: user.id,
            email: user.email,
            username: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          }]);
        }
      } catch (userErr) {
        console.error('사용자 정보 처리 실패:', userErr);
        // 사용자 정보 처리 실패해도 글 작성 시도
      }

      // 이미지 업로드 (있는 경우)
      let imageUrl = null;
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `posts/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, imageFile);

          if (uploadError) {
            console.error('이미지 업로드 실패:', uploadError);
            // Storage bucket이 없어도 글 작성은 계속 진행
          } else {
            const { data: urlData } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);
            imageUrl = urlData.publicUrl;
          }
        } catch (uploadErr) {
          console.error('이미지 업로드 중 오류:', uploadErr);
          // 이미지 업로드 실패해도 글 작성은 계속
        }
      }

      // 게시글 작성
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: form.title.trim(),
            content: form.content.trim(),
            category: 'free',
            image_url: imageUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 포인트 지급 (커뮤니티 글 작성: 5포인트)
      try {
        await awardPoints(user.id, POINT_REWARDS.COMMUNITY_POST, '커뮤니티 글 작성');
      } catch (pointErr) {
        console.error('포인트 지급 실패:', pointErr);
        // 포인트 지급 실패해도 글 작성은 성공으로 처리
      }

      router.push('/community');
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">커뮤니티 글을 작성하려면 로그인하세요.</p>
          <Link
            href="/community"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/community" className="text-2xl font-bold">
            🔥 글쓰기
          </Link>
          <Link
            href="/community"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg transition-colors cursor-pointer"
          >
            취소
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* 사용자 정보 */}
          <div className="mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {(user.user_metadata?.name || user.email || '?')[0].toUpperCase()}
            </div>
            <span className="font-medium text-gray-900">
              {user.user_metadata?.name || user.email?.split('@')[0]}
            </span>
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 text-lg font-medium text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              maxLength={100}
              required
            />
          </div>

          {/* 내용 */}
          <div className="mb-6">
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="내용을 입력하세요"
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-[300px] resize-y"
              required
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 첨부 (선택사항)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 file:cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF (최대 1MB)</p>
            
            {/* 이미지 미리보기 */}
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                  style={{ maxHeight: '300px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? '작성 중...' : '글 작성'}
            </button>
            <Link
              href="/community"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors text-center cursor-pointer"
            >
              취소
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
