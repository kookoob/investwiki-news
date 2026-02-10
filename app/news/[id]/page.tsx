import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'
import { fetchTickerPrices } from '@/lib/fetchPrices'
import CopyButton from './CopyButton'
import Comments from './Comments'
import VoteButtons from './VoteButtons'
import Header from '@/app/components/Header'
import { Metadata } from 'next'

async function getNewsById(id: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'news.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const allNews = JSON.parse(fileContents)
    return allNews.find((item: any) => item.id === id)
  } catch {
    return null
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const news = await getNewsById(id)

  if (!news) {
    return {
      title: '뉴스를 찾을 수 없습니다 - StockHub',
      description: '요청하신 뉴스를 찾을 수 없습니다.',
    }
  }

  const title = `${news.title} - StockHub`
  const description = news.summary.replace(/\n/g, ' ').substring(0, 160)
  const url = `https://stockhub.kr/news/${news.id}`

  return {
    title,
    description,
    keywords: [
      ...(news.tickers || []),
      news.source,
      '투자뉴스',
      '미국주식',
      '경제뉴스',
    ],
    authors: [{ name: 'StockHub' }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'StockHub',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: news.date,
      images: [
        {
          url: 'https://stockhub.kr/logo.png',
          width: 1280,
          height: 698,
          alt: news.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://stockhub.kr/logo.png'],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await getNewsById(id)

  // 가격 정보 가져오기
  const tickerData = news?.tickers ? await fetchTickerPrices(news.tickers) : []

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">뉴스를 찾을 수 없습니다</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            뉴스 목록으로
          </Link>
        </div>
      </div>
    )
  }

  // Schema.org NewsArticle 구조화 데이터
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.summary.replace(/\n/g, ' ').substring(0, 160),
    image: 'https://stockhub.kr/logo.png',
    datePublished: news.date,
    dateModified: news.date,
    author: {
      '@type': 'Organization',
      name: news.source,
    },
    publisher: {
      '@type': 'Organization',
      name: 'StockHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://stockhub.kr/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://stockhub.kr/news/${news.id}`,
    },
    articleBody: news.content,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* 헤더 */}
      <Header />

      {/* 뉴스 상세 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* 제목 */}
          <div className="flex items-start gap-3 mb-4">
            {/* 중요도 표시 */}
            {news.importance && (
              <div className="flex-shrink-0 mt-1">
                {news.importance === 'high' && <span className="text-2xl" title="높은 중요도">🔴</span>}
                {news.importance === 'medium' && <span className="text-2xl" title="중간 중요도">🟡</span>}
                {news.importance === 'low' && <span className="text-2xl" title="낮은 중요도">⚪</span>}
              </div>
            )}
            <h1 className="flex-1 text-2xl font-bold text-gray-900 dark:text-white">{news.title}</h1>
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-blue-600 dark:text-blue-400">{news.source}</span>
            <span>•</span>
            <span>{news.date}</span>
          </div>

          {/* AI 요약 */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 mb-6">
            <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">🤖 AI 요약</h2>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{news.summary}</p>
          </div>

          {/* 전체 내용 */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {news.content.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* 관련 종목 가격 */}
          {tickerData.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">📊 관련 종목</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tickerData.map((item) => (
                  <div key={item.symbol} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</span>
                      <span
                        className={`text-xs font-medium ${
                          item.change >= 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 원문 링크 및 공유 */}
          {news.link && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <a
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  원문 보기 →
                </a>
                <CopyButton url={`https://stockhub.kr/news/${news.id}`} />
              </div>
            </div>
          )}

          {/* 투표 */}
          <VoteButtons newsId={news.id} />

          {/* 댓글 */}
          <Comments newsId={news.id} />
        </article>
      </main>
    </div>
  )
}
