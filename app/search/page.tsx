'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import BookmarkButton from '../components/BookmarkButton';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  link: string;
  tickers?: string[];
  importance?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  async function performSearch(q: string) {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // 모든 페이지에서 검색
      let allNews: NewsItem[] = [];
      let page = 1;
      
      while (true) {
        const response = await fetch(`/news-${page}.json`);
        if (!response.ok) break;
        
        const pageNews = await response.json();
        if (pageNews.length === 0) break;
        
        allNews = [...allNews, ...pageNews];
        page++;
        
        // 최대 10페이지 (500개)까지만 검색
        if (page > 10) break;
      }

      // 검색어로 필터링
      const searchLower = q.toLowerCase();
      const filtered = allNews.filter((item) => {
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.summary.toLowerCase().includes(searchLower) ||
          item.source.toLowerCase().includes(searchLower) ||
          (item.tickers && item.tickers.some(t => t.toLowerCase().includes(searchLower)))
        );
      });

      setResults(filtered);
      setTotalResults(filtered.length);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 검색 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 기사 검색
          </h1>
          
          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 내용, 티커로 검색..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? '검색 중...' : '검색'}
            </button>
          </form>
        </div>

        {/* 검색 결과 */}
        {query && (
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              "{query}" 검색 결과: {totalResults}개
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">검색 중...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((item) => (
              <article
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <Link href={`/news/${item.id}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <h2 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">
                      {item.title}
                    </h2>
                    <BookmarkButton itemId={item.id} itemType="news" size="md" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {item.source}
                    </span>
                    <span>•</span>
                    <span>{item.date}</span>
                    
                    {item.importance && (
                      <>
                        <span>•</span>
                        <span>
                          {item.importance === 'very_high' && '⭐⭐⭐⭐⭐'}
                          {item.importance === 'high' && '⭐⭐⭐⭐'}
                          {item.importance === 'medium' && '⭐⭐⭐'}
                          {item.importance === 'low' && '⭐⭐'}
                          {item.importance === 'very_low' && '⭐'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                  
                  {item.tickers && item.tickers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tickers.map((ticker) => (
                        <span
                          key={ticker}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded"
                        >
                          {ticker}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              "{query}"에 대한 검색 결과가 없습니다.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              검색어를 입력하세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
