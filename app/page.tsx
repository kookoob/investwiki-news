import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'

async function getNews() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'news.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch {
    return []
  }
}

export default async function Home() {
  const news = await getNews()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">InvestWiki 속보</h1>
          <p className="text-sm text-gray-500 mt-1">실시간 투자·경제 뉴스</p>
        </div>
      </header>

      {/* 뉴스 피드 */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {news.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            뉴스를 불러오는 중...
          </div>
        )}
        
        {news.map((item: any) => (
          <Link
            key={item.id}
            href={`/news/${item.id}`}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {item.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium text-blue-600">{item.source}</span>
              <span>•</span>
              <span>{item.date}</span>
            </div>
          </Link>
        ))}
      </main>

      {/* 푸터 */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 InvestWiki. Powered by Gemini AI</p>
      </footer>
    </div>
  )
}
