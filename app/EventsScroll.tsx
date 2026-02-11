import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

interface Event {
  id: string;
  title: string;
  link: string;
  date: string;
  time: string | null;
  emoji: string;
  type?: string;
  ticker?: string;
  company?: string;
  announced?: boolean;  // 실적 발표 완료 여부
  eps?: string | null;
  sales?: string | null;
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
  return `${diffDays}일 후`;
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

export default async function EventsScroll() {
  const allEvents = await getEvents();
  
  // 오늘 이후 이벤트만 필터링
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const events = allEvents
    .filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 mb-4">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">📅 다가오는 경제일정</h3>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {events.slice(0, 5).map((event) => (
            <Link
              key={event.id}
              href={`/events/${encodeURIComponent(event.id)}`}
              className="flex-shrink-0 w-64 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors bg-gray-50"
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{event.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {getCompanyName(event)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(event.date)}
                    {event.announced ? (
                      <span className="text-red-600 font-semibold ml-1">
                        · 실적발표({event.time} KST)
                      </span>
                    ) : event.time && event.time !== '미정' && event.time !== '00:00' ? (
                      ` · ${event.time} KST`
                    ) : (
                      ' · 시간 미정'
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
