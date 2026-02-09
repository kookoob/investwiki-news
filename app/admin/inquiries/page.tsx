'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Inquiry {
  id: string;
  email: string;
  subject: string;
  content: string;
  status: string;
  created_at: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    // 관리자 확인
    const savedUser = localStorage.getItem('stockhub_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // 관리자 권한 확인
      if (userData.email !== 'kyongg02@gmail.com') {
        alert('관리자 권한이 없습니다.');
        window.location.href = '/';
        return;
      }
      
      fetchInquiries();
    } else {
      alert('로그인이 필요합니다.');
      window.location.href = '/';
    }
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('문의 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // 목록 새로고침
      fetchInquiries();
      alert('상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchInquiries();
      setSelectedInquiry(null);
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">📧 문의 관리</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            ← 홈으로
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">전체 문의</div>
            <div className="text-3xl font-bold text-gray-900">{inquiries.length}</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">대기 중</div>
            <div className="text-3xl font-bold text-orange-600">
              {inquiries.filter(i => i.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">완료</div>
            <div className="text-3xl font-bold text-green-600">
              {inquiries.filter(i => i.status === 'resolved').length}
            </div>
          </div>
        </div>

        {/* 문의 목록 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">제목</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">이메일</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">날짜</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    문의가 없습니다.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          inquiry.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {inquiry.status === 'pending' ? '대기 중' : '완료'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {inquiry.subject}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inquiry.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(inquiry.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          updateStatus(
                            inquiry.id,
                            inquiry.status === 'pending' ? 'resolved' : 'pending'
                          )
                        }
                        className="text-sm text-blue-600 hover:text-blue-800 mr-2"
                      >
                        {inquiry.status === 'pending' ? '완료 처리' : '대기로 변경'}
                      </button>
                      <button
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">문의 상세</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">이메일</div>
                <div className="text-gray-900">{selectedInquiry.email}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">제목</div>
                <div className="text-gray-900 font-medium">{selectedInquiry.subject}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">내용</div>
                <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedInquiry.content}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">접수 일시</div>
                <div className="text-gray-900">
                  {new Date(selectedInquiry.created_at).toLocaleString('ko-KR')}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">상태</div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    selectedInquiry.status === 'pending'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedInquiry.status === 'pending' ? '대기 중' : '완료'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() =>
                  updateStatus(
                    selectedInquiry.id,
                    selectedInquiry.status === 'pending' ? 'resolved' : 'pending'
                  )
                }
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {selectedInquiry.status === 'pending' ? '완료 처리' : '대기로 변경'}
              </button>
              <button
                onClick={() => deleteInquiry(selectedInquiry.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
