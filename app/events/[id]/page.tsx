import { notFound } from 'next/navigation';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { getIndicatorInfo } from '@/lib/economicIndicators';

// ISR: 60초마다 재생성
export const revalidate = 60;
export const dynamicParams = true;

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
  announced?: boolean;  // 실적 발표 완료 여부
  eps?: string | null;   // 실제 EPS
  eps_est?: string | null;  // 예상 EPS
  sales?: string | null;    // 실제 매출
  sales_est?: string | null; // 예상 매출
  ai_comment?: string;      // AI 코멘트
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
  // URL 디코딩 처리 (한글 ID 지원)
  const decodedId = decodeURIComponent(id);
  return events.find((e: Event) => e.id === decodedId) || null;
}

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
  const indicatorInfo = isEconomic ? getIndicatorInfo(event.title) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            ← 뉴스로 돌아가기
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* 제목 */}
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{event.emoji}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {event.company || event.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(event.date).toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short',
                  timeZone: 'Asia/Seoul'
                })}
                {event.announced ? (
                  <span className="ml-2">
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      실적발표({event.time} KST)
                    </span>
                  </span>
                ) : event.time && event.time !== '미정' ? (
                  <span className="ml-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400">{event.time_kr || event.time}</span>
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">(한국시간)</span>
                  </span>
                ) : event.time === '미정' ? (
                  <span className="ml-2 text-gray-500 dark:text-gray-400">시간 미정</span>
                ) : null}
              </p>
            </div>
          </div>

          {/* 실적 발표 정보 */}
          {isEarnings && (
            <div className="space-y-4">
              {/* 발표 완료 - 실제 실적 */}
              {event.announced && (
                <div className="bg-red-50 dark:bg-black border-2 border-red-500 dark:border-red-700 rounded-lg p-4">
                  <h2 className="font-bold text-red-900 dark:text-red-400 mb-3 flex items-center gap-2">
                    <span className="text-xl">🔴</span> 실적 발표 완료
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {event.eps && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">실제 EPS</p>
                        <p className="font-bold text-xl text-red-900 dark:text-red-400">{event.eps}</p>
                        {event.eps_est && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">예상: {event.eps_est}</p>
                        )}
                      </div>
                    )}
                    {event.sales && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">실제 매출</p>
                        <p className="font-bold text-xl text-red-900 dark:text-red-400">{event.sales}</p>
                        {event.sales_est && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">예상: {event.sales_est}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {event.ai_comment && (
                    <div className="bg-white dark:bg-gray-800 rounded p-3 border border-red-200 dark:border-red-900">
                      <p className="text-sm text-gray-700 dark:text-gray-200">{event.ai_comment}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 발표 전 - 예상 실적 */}
              <div className="bg-blue-50 dark:bg-black border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h2 className="font-bold text-blue-900 dark:text-blue-400 mb-3">📊 {event.announced ? '발표 전 예상' : '실적 발표 정보'}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {event.ticker && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">티커</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.ticker}</p>
                    </div>
                  )}
                  {event.sector && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">섹터</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.sector}</p>
                    </div>
                  )}
                  {event.market_cap && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">시가총액</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatMarketCap(event.market_cap)}</p>
                    </div>
                  )}
                  {event.eps_est && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">예상 EPS</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.eps_est}</p>
                    </div>
                  )}
                  {event.sales_est && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">예상 매출</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.sales_est}</p>
                    </div>
                  )}
                  {event.eps_estimate && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">예상 EPS</p>
                      <p className="font-semibold text-gray-900 dark:text-white">${event.eps_estimate.toFixed(2)}</p>
                    </div>
                  )}
                  {event.eps_current && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">현재 EPS</p>
                      <p className="font-semibold text-gray-900 dark:text-white">${event.eps_current.toFixed(2)}</p>
                    </div>
                  )}
                </div>
                {!event.announced && event.ai_comment && (
                  <div className="mt-4 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-900">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">💡 AI 전망</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{event.ai_comment}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">💡 주요 포인트</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200 space-y-1">
                  <li>실적 발표 전 투자자 관심 집중</li>
                  <li>예상 EPS 대비 실제 결과 확인 필요</li>
                  <li>발표 후 주가 변동성 예상</li>
                </ul>
              </div>
            </div>
          )}

          {/* 경제 지표 정보 */}
          {isEconomic && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-black border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <h2 className="font-bold text-yellow-900 dark:text-yellow-400 mb-3">📈 경제 지표 정보</h2>
                {event.description && (
                  <p className="text-gray-700 dark:text-white mb-4">{event.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {event.country && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">국가</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.country}</p>
                    </div>
                  )}
                  {event.importance && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">중요도</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {event.importance === 'high' ? '🔴 높음' : 
                         event.importance === 'medium' ? '🟡 중간' : '🟢 낮음'}
                      </p>
                    </div>
                  )}
                  {event.category && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">카테고리</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.category}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 상세 지표 설명 (토스증권 스타일) */}
              {indicatorInfo && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {indicatorInfo.fullName}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-blue-600">📊</span> 이 지표는 무엇인가요?
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {indicatorInfo.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-red-600">🔥</span> 왜 중요한가요?
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {indicatorInfo.importance}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-green-600">💡</span> 어떻게 해석하나요?
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {indicatorInfo.interpretation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">💡 주요 포인트</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200 space-y-1">
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
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
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
