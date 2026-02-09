'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ContactPage() {
  const [form, setForm] = useState({
    email: '',
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.subject || !form.content) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            email: form.email,
            subject: form.subject,
            content: form.content,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      setSubmitted(true);
      setForm({ email: '', subject: '', content: '' });
    } catch (err) {
      console.error('문의 제출 실패:', err);
      setError('문의 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📨 문의하기</h1>
          <p className="text-gray-600">궁금한 점이나 제안사항을 남겨주세요</p>
        </div>

        {/* 문의 폼 */}
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-green-100 rounded-lg p-8 text-center border border-green-300">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                문의가 접수되었습니다!
              </h2>
              <p className="text-gray-600 mb-6">
                빠른 시일 내에 답변드리겠습니다.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                추가 문의하기
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm"
            >
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* 이메일 */}
              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* 제목 */}
              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="문의 제목을 입력하세요"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* 내용 */}
              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">
                  내용 *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="문의 내용을 자세히 입력해주세요"
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  required
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? '제출 중...' : '문의 제출'}
              </button>
            </form>
          )}

          {/* 돌아가기 버튼 */}
          <div className="text-center mt-8">
            <a
              href="/"
              className="inline-block px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
            >
              ← 홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
