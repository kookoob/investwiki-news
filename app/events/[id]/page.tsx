import { notFound } from 'next/navigation';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

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
  eps_estimate?: number;
  eps_current?: number;
  market_cap?: number;
  sector?: string;
  country?: string;
  importance?: string;
  category?: string;
}

async function getAllEvents(): Promise<Event[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'events.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

async function getEvent(id: string): Promise<Event | null> {
  const events = await getAllEvents();
  return events.find((e: Event) => e.id === id) || null;
}

// 동적 경로 허용 (정적 생성 비활성화)
export const dynamicParams = true;

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000_000) {
    return `${(marketCap / 1_000_000_000_000).toFixed(2)}조 달러`;
  } else if (marketCap >= 1_000_000_000) {
    return `${(marketCap / 1_000_000_000).toFixed(2)}억 달러`;
  }
  return `${marketCap.toLocaleString()}달러`;
}

export default async function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const isEarnings = event.type === 'earnings';
  const isEconomic = event.type === 'economic';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← 뉴스로 돌아가기
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 제목 */}
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{event.emoji}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {event.company || event.title}
              </h1>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                })}
                {event.time && ` ${event.time_kr || event.time}`}
              </p>
            </div>
          </div>

          {/* 실적 발표 정보 */}
          {isEarnings && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="font-bold text-gray-900 mb-3">📊 실적 발표 정보</h2>
                <div className="grid grid-cols-2 gap-4">
                  {event.ticker && (
                    <div>
                      <p className="text-sm text-gray-600">티커</p>
                      <p className="font-semibold text-gray-900">${event.ticker}</p>
                    </div>
                  )}
                  {event.sector && (
                    <div>
                      <p className="text-sm text-gray-600">섹터</p>
                      <p className="font-semibold text-gray-900">{event.sector}</p>
                    </div>
                  )}
                  {event.market_cap && (
                    <div>
                      <p className="text-sm text-gray-600">시가총액</p>
                      <p className="font-semibold text-gray-900">{formatMarketCap(event.market_cap)}</p>
                    </div>
                  )}
                  {event.eps_estimate && (
                    <div>
                      <p className="text-sm text-gray-600">예상 EPS</p>
                      <p className="font-semibold text-gray-900">${event.eps_estimate.toFixed(2)}</p>
                    </div>
                  )}
                  {event.eps_current && (
                    <div>
                      <p className="text-sm text-gray-600">현재 EPS</p>
                      <p className="font-semibold text-gray-900">${event.eps_current.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">💡 주요 포인트</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>실적 발표 전 투자자 관심 집중</li>
                  <li>예상 EPS 대비 실제 결과 확인 필요</li>
                  <li>발표 후 주가 변동성 예상</li>
                </ul>
              </div>
            </div>
          )}

          {/* 경제 지표 정보 */}
          {isEconomic && event.description && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="font-bold text-gray-900 mb-3">📈 경제 지표 정보</h2>
                <p className="text-gray-700 mb-4">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {event.country && (
                    <div>
                      <p className="text-sm text-gray-600">국가</p>
                      <p className="font-semibold text-gray-900">{event.country}</p>
                    </div>
                  )}
                  {event.importance && (
                    <div>
                      <p className="text-sm text-gray-600">중요도</p>
                      <p className="font-semibold text-gray-900">
                        {event.importance === 'high' ? '🔴 높음' : 
                         event.importance === 'medium' ? '🟡 중간' : '🟢 낮음'}
                      </p>
                    </div>
                  )}
                  {event.category && (
                    <div>
                      <p className="text-sm text-gray-600">카테고리</p>
                      <p className="font-semibold text-gray-900">{event.category}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">💡 주요 포인트</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>시장 예상치와 실제 수치 비교 중요</li>
                  <li>발표 시점 전후 시장 변동성 주의</li>
                  <li>중앙은행 정책 결정에 영향 가능</li>
                </ul>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="mt-6 flex gap-3">
            <Link
              href="/events"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              전체 일정 보기
            </Link>
            <Link
              href="/"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              뉴스 피드로
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
