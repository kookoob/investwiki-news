'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function ProfileEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    username: '',
    avatar_url: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    setUser(user);
    
    // users 테이블에서 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('users')
      .select('username, avatar_url, bio')
      .eq('id', user.id)
      .single();
    
    setForm({
      username: profile?.username || user.user_metadata?.name || '',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      bio: profile?.bio || '',
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    // 파일 크기 제한 (1MB)
    if (file.size > 1024 * 1024) {
      alert('이미지 크기는 1MB 이하로 제한됩니다');
      return;
    }

    setUploading(true);

    try {
      // 간단한 방법: 이미지를 Base64로 변환
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // avatar_url에 base64 데이터 저장
        setForm({ ...form, avatar_url: base64 });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드에 실패했습니다');
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.username.trim()) {
      setError('닉네임을 입력하세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 닉네임 중복 확인
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', form.username.trim())
        .neq('id', user.id)
        .single();

      if (existing) {
        setError('이미 사용 중인 닉네임입니다');
        setLoading(false);
        return;
      }

      // 프로필 업데이트
      const { error } = await supabase
        .from('users')
        .update({
          username: form.username.trim(),
          avatar_url: form.avatar_url || null,
          bio: form.bio.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Supabase auth user_metadata 업데이트 (선택사항)
      await supabase.auth.updateUser({
        data: {
          name: form.username.trim(),
          avatar_url: form.avatar_url,
        }
      });

      alert('프로필이 업데이트되었습니다');
      router.push('/profile');
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
      setError('프로필 업데이트에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">프로필 편집</h1>
            <Link
              href="/profile"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              취소
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* 프로필 이미지 */}
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-3">프로필 이미지</label>
            <div className="flex items-center gap-6">
              {/* 현재 이미지 */}
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  user.username?.charAt(0).toUpperCase()
                )}
              </div>

              {/* 업로드 버튼 */}
              <div>
                <label
                  htmlFor="avatar-upload"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer inline-block transition-colors"
                >
                  {uploading ? '업로드 중...' : '이미지 변경'}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG, GIF (최대 1MB)
                </p>
                {form.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, avatar_url: '' })}
                    className="text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    이미지 제거
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 닉네임 */}
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-2">닉네임</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="닉네임 입력"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              maxLength={20}
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              2-20자 이내로 입력하세요
            </p>
          </div>

          {/* 자기소개 */}
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-2">자기소개</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="자신을 소개해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-y min-h-[100px]"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-2">
              최대 200자까지 입력 가능합니다
            </p>
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </main>
    </div>
  );
}
