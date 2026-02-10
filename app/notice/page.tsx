'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Notice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    try {
      const response = await fetch('/api/notices');
      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  }

  const pinnedNotices = notices.filter(n => n.pinned);
  const regularNotices = notices.filter(n => !n.pinned);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">📢 공지사항</h1>
            <Link
              href="/notice/write"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              글쓰기
            </Link>
          </div>

          {/* 공지사항 목록 */}
          <div className="bg-white rounded-lg border border-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">로딩 중...</div>
            ) : notices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                공지사항이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* 고정 공지 */}
                {pinnedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                        공지
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notice.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                        </p>
                        {expandedId === notice.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                            {notice.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 일반 공지 */}
                {regularNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notice.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                        </p>
                        {expandedId === notice.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                            {notice.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
