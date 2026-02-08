import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'
import { fetchTickerPrices } from '@/lib/fetchPrices'

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← 뉴스 목록으로
          </Link>
        </div>
      </header>

      {/* 뉴스 상세 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{news.title}</h1>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            <span className="font-medium text-blue-600">{news.source}</span>
            <span>•</span>
            <span>{news.date}</span>
          </div>

          {/* AI 요약 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">🤖 AI 요약</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{news.summary}</p>
          </div>

          {/* 전체 내용 */}
          <div className="prose prose-gray max-w-none">
            {news.content.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* 관련 종목 가격 */}
          {tickerData.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">📊 관련 종목</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tickerData.map((item) => (
                  <div key={item.symbol} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.symbol}</span>
                      <span className="text-base font-semibold text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{item.name}</span>
                      <span
                        className={`text-xs font-medium ${
                          item.change >= 0 ? 'text-red-600' : 'text-blue-600'
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

          {/* 원문 링크 */}
          {news.link && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                원문 보기 →
              </a>
            </div>
          )}
        </article>
      </main>
    </div>
  )
}
