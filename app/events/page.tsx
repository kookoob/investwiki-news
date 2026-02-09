import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

interface Event {
  id: string;
  title: string;
  link: string;
  source: string;
  date: string;
  time: string | null;
  type: string;
  emoji: string;
}

async function getEvents(): Promise<Event[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'events.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays < 7) return `${diffDays}일 후`;
  
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">📅 이벤트 캘린더</h1>
            <Link
              href="/"
              className="text-blue-600 hover:underline text-sm"
            >
              ← 홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 이벤트 리스트 */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500">예정된 이벤트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <a
                key={event.id}
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {/* 이모지 */}
                  <div className="text-3xl">{event.emoji}</div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    {/* 타입 태그 */}
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        event.type === 'earnings' ? 'bg-green-100 text-green-700' :
                        event.type === 'conference' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'shareholders' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.type === 'earnings' ? '실적발표' :
                         event.type === 'conference' ? '컨퍼런스' :
                         event.type === 'shareholders' ? '주주총회' : '기타'}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>

                    {/* 날짜/시간 */}
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium">{formatDate(event.date)}</span>
                      {event.time && (
                        <>
                          <span>•</span>
                          <span>{event.time}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{event.source}</span>
                    </div>
                  </div>

                  {/* 외부 링크 아이콘 */}
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
