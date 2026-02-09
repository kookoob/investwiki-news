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
  time_kr?: string;
  type: string;
  emoji: string;
  ticker?: string;
  company?: string;
  eps_estimate?: number;
  eps_current?: number;
  market_cap?: number;
  sector?: string;
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
              src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&countries=25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5&calType=week&timeZone=28&lang=18"
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
              <div
                key={event.id}
                className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* 헤더 */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{event.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                        실적발표
                      </span>
                      {event.sector && (
                        <span className="text-xs text-gray-500">{event.sector}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {event.ticker} {event.company && `- ${event.company}`}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold text-gray-900 mb-1">
                        📅 {new Date(event.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                      </div>
                      {event.time && (
                        <div className="text-blue-600 font-medium">
                          ⏰ {event.time} (한국 시간)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  {event.eps_estimate && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">EPS 예상</div>
                      <div className="text-lg font-semibold text-blue-600">${event.eps_estimate}</div>
                    </div>
                  )}
                  {event.eps_current && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">현재 EPS</div>
                      <div className="text-lg font-semibold text-gray-700">${event.eps_current}</div>
                    </div>
                  )}
                  {event.market_cap && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">시가총액</div>
                      <div className="text-lg font-semibold text-gray-700">
                        ${(event.market_cap / 1_000_000_000).toFixed(1)}B
                      </div>
                    </div>
                  )}
                </div>

                {/* 하단 링크 */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={`https://finance.yahoo.com/quote/${event.ticker}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Yahoo Finance에서 자세히 보기 →
                  </a>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
