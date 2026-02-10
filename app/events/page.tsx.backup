import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

interface Event {
  id: string;
  title: string;
  link: string;
  date: string;
  time: string | null;
  time_kr?: string;
  emoji: string;
  type?: string;
  ticker?: string;
  company?: string;
  description?: string;
}

async function getEvents() {
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
  
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function getCompanyName(event: Event): string {
  if (event.company) {
    const companyMap: { [key: string]: string } = {
      "McDonald's Corporation": "맥도날드",
      "Walmart Inc.": "월마트",
      "The Home Depot, Inc.": "홈디포",
    };
    
    const simpleName = companyMap[event.company];
    if (simpleName && event.type === 'earnings') {
      return `${simpleName} 실적 발표`;
    }
  }
  
  return event.title;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              ← 뉴스로 돌아가기
            </Link>
            <h1 className="text-lg font-bold text-gray-900">📅 전체 경제일정</h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            등록된 일정이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: Event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{event.emoji}</span>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {getCompanyName(event)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {formatDate(event.date)}
                      {event.time && ` · ${event.time_kr || event.time}`}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="text-gray-400">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
