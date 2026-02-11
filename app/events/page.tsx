import Header from '@/app/components/Header'
import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'

// ISR: 60초마다 재생성
export const revalidate = 60

async function getEvents() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'events.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch {
    return []
  }
}

async function getWeeklySummary() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'weekly-summary.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch {
    return null
  }
}

export default async function EventsPage() {
  const events = await getEvents()
  const weeklySummary = await getWeeklySummary()
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  // 오늘 이후 이벤트만 필터링
  const upcomingEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= now
  })
  
  // 날짜별로 그룹화
  const eventsByDate = upcomingEvents.reduce((acc: any, event: any) => {
    const date = new Date(event.date).toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📅 경제일정</h1>
            <p className="text-gray-600 dark:text-gray-400">주요 경제 이벤트 및 실적 발표 일정</p>
          </div>

          {/* 주간 AI 요약 */}
          {weeklySummary && (
            <div className="mb-6 bg-gray-50 dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-3xl">🤖</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {weeklySummary.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {weeklySummary.contents}
                  </p>
                  {weeklySummary.additionalContents && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {weeklySummary.additionalContents}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {Object.keys(eventsByDate).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">예정된 경제일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(eventsByDate).map(([date, dateEvents]: [string, any]) => (
                <div key={date} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-100 dark:border-blue-800">
                    <h2 className="font-bold text-blue-900 dark:text-blue-100">{date}</h2>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {dateEvents.map((event: any) => (
                      <Link
                        key={event.id}
                        href={`/events/${encodeURIComponent(event.id)}`}
                        className="block px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-20 text-center">
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {event.time && event.time !== '미정' && event.time !== '00:00' ? event.time : '시간 미정'}
                            </div>
                            {event.time && event.time !== '미정' && event.time !== '00:00' && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">KST</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                            {event.company && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{event.company}</p>
                            )}
                            {event.type && (
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {event.type}
                              </span>
                            )}
                          </div>
                          <div className="flex-shrink-0 flex items-center">
                            <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              상세보기 →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
