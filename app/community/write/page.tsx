'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WritePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // localStorage에서 사용자 정보 확인
    const savedUser = localStorage.getItem('stockhub_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setShowLogin(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요');
      return;
    }

    setLoading(true);
    try {
      // 기존 사용자 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', nickname.trim())
        .single();

      let userData;
      if (existingUser) {
        userData = existingUser;
        
        // email이 입력되었고, 기존 email과 다르면 업데이트
        if (email.trim() && email.trim() !== existingUser.email) {
          await supabase
            .from('users')
            .update({ email: email.trim() })
            .eq('id', existingUser.id);
          
          userData = { ...existingUser, email: email.trim() };
        }
      } else {
        // 새 사용자 생성
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ 
            username: nickname.trim(),
            email: email.trim() || null
          }])
          .select()
          .single();

        if (error) throw error;
        userData = newUser;

        // 레벨 정보 생성
        await supabase.from('user_levels').insert([
          {
            user_id: userData.id,
            level: 1,
            exp: 0,
          },
        ]);
      }

      // localStorage에 저장
      localStorage.setItem('stockhub_user', JSON.stringify(userData));
      setUser(userData);
      setShowLogin(false);
    } catch (err) {
      console.error('로그인 실패:', err);
      alert('로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('로그인이 필요합니다.');
      setShowLogin(true);
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: form.title.trim(),
            content: form.content.trim(),
            category: 'free',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 경험치 추가 (+10)
      await addExp(user.id, 10, 'post', data.id);

      router.push(`/community/${data.id}`);
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  async function addExp(userId: string, exp: number, reason: string, referenceId: string) {
    try {
      // 경험치 로그 추가
      await supabase.from('exp_logs').insert([
        {
          user_id: userId,
          exp_change: exp,
          reason,
          reference_id: referenceId,
        },
      ]);

      // 레벨 정보 가져오기
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (levelData) {
        const newExp = levelData.exp + exp;
        const expNeeded = calculateExpNeeded(levelData.level);
        
        let newLevel = levelData.level;
        let remainingExp = newExp;

        // 레벨업 체크
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
      } else {
        // 레벨 정보 없으면 생성
        await supabase.from('user_levels').insert([
          {
            user_id: userId,
            level: 1,
            exp,
          },
        ]);
      }
    } catch (error) {
      console.error('경험치 추가 실패:', error);
    }
  }

  function calculateExpNeeded(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level - 1));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">✍️ 글쓰기</h1>
            <Link
              href="/community"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              취소
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {showLogin ? (
          <div className="bg-white rounded-lg p-8 border border-gray-200 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">로그인</h2>
            <p className="text-gray-600 mb-6 text-center">닉네임을 입력하세요</p>
            
            <div className="mb-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={20}
              />
            </div>

            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 (선택, 관리자 권한용)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <p className="text-xs text-gray-500 mt-2">
                ※ 이메일을 입력하면 관리자 권한이 자동 부여됩니다
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? '로그인 중...' : '시작하기'}
            </button>

            <Link
              href="/community"
              className="block text-center mt-4 text-gray-600 hover:text-gray-900"
            >
              취소
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* 사용자 정보 */}
            <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{user?.username}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('stockhub_user');
                  setUser(null);
                  setShowLogin(true);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>

            {/* 제목 */}
          <div className="mb-6">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors"
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
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
              required
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? '작성 중...' : '작성 완료'}
          </button>
        </form>
        )}
      </main>
    </div>
  );
}
