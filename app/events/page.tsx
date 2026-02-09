import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import Header from '../components/Header';

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
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">📅 이벤트 캘린더</h1>
        {/* Investing.com 경제 캘린더 위젯 */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 경제 캘린더</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <iframe
              src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=2,3&features=datepicker,timezone&countries=25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5&calType=week&timeZone=28&lang=18"
              width="100%"
              height="600"
              frameBorder="0"
              allowTransparency={true}
              marginWidth={0}
              marginHeight={0}
              className="w-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Powered by{' '}
            <a
              href="https://www.investing.com"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Investing.com
            </a>
          </p>
        </div>

        {/* 기업 실적 발표 */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💼 기업 실적 발표</h2>
          {events.length === 0 ? (
            <p className="text-center text-gray-500 py-8">예정된 실적 발표가 없습니다.</p>
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
        </div>
      </main>
    </div>
  );
}
