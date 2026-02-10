'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function NoticeWritePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
    pinned: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setAuthLoading(false);

    if (!user || user.email !== 'kyongg02@gmail.com') {
      alert('관리자만 작성할 수 있습니다.');
      router.push('/notice');
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하로 제한됩니다');
      return;
    }

    setImageFile(file);
    
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
      // 이미지 업로드
      let imageUrl = null;
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `notices/${fileName}`;

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

      const { error } = await supabase
        .from('notices')
        .insert([
          {
            title: form.title.trim(),
            content: form.content.trim(),
            pinned: form.pinned,
            image_url: imageUrl,
          },
        ]);

      if (error) throw error;

      router.push('/notice');
    } catch (err) {
      console.error('공지사항 작성 실패:', err);
      setError('공지사항 작성에 실패했습니다.');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/notice" className="text-2xl font-bold">
            📢 공지사항 작성
          </Link>
          <Link
            href="/notice"
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

          {/* 상단 고정 */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">상단 고정</span>
            </label>
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
            <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF (최대 5MB)</p>
            
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
              {loading ? '작성 중...' : '공지 작성'}
            </button>
            <Link
              href="/notice"
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
