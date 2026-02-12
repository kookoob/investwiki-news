'use client'

import Header from '@/app/components/Header'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  date: string
  time: string
  company?: string
  type?: string
  actual?: number | null
  forecast?: number | null
  historical?: number | null
}

interface WeeklySummary {
  title: string
  contents: string
  additionalContents?: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  
  useEffect(() => {
    // 데이터 로드
    fetch('/events.json')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(() => setEvents([]))
    
    fetch('/weekly-summary.json')
      .then(res => res.json())
      .then(data => setWeeklySummary(data))
      .catch(() => setWeeklySummary(null))
  }, [])
  
  // 한국시간(KST) 기준 오늘
  const nowKST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
  nowKST.setHours(0, 0, 0, 0)
  
  const thirtyDaysAgo = new Date(nowKST)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  // 다가오는 일정 (오늘 이후, 한국시간 기준)
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= nowKST
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // 지난 일정 (최근 30일, 한국시간 기준)
  const pastEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= thirtyDaysAgo && eventDate < nowKST
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 최신순
  
  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents
  
  // 날짜별로 그룹화
  const eventsByDate = displayEvents.reduce((acc: any, event: any) => {
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
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {weeklySummary.additionalContents}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 탭 */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              다가오는 일정 ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              지난 일정 ({pastEvents.length})
            </button>
          </div>

          {Object.keys(eventsByDate).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === 'upcoming' ? '예정된 경제일정이 없습니다.' : '지난 경제일정이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(eventsByDate).map(([date, dateEvents]: [string, any]) => (
                <div key={date} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className={`px-4 py-3 border-b ${
                    activeTab === 'past' 
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                      : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800'
                  }`}>
                    <h2 className={`font-bold ${
                      activeTab === 'past'
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {date}
                    </h2>
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
                            {/* 지난 일정의 경우 결과값 표시 */}
                            {activeTab === 'past' && event.type === 'economic' && event.actual !== null && event.actual !== undefined && (
                              <div className="mt-2 flex gap-3 text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  실제: <span className="font-semibold text-gray-900 dark:text-white">{event.actual}</span>
                                </span>
                                {event.forecast !== null && event.forecast !== undefined && (
                                  <span className="text-gray-600 dark:text-gray-400">
                                    예상: {event.forecast}
                                  </span>
                                )}
                                {event.historical !== null && event.historical !== undefined && (
                                  <span className="text-gray-600 dark:text-gray-400">
                                    이전: {event.historical}
                                  </span>
                                )}
                              </div>
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
