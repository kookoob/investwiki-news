import Link from 'next/link';

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
  description?: string;
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
  // 회사명이 있으면 간단한 이름으로 변환
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
  
  // 기본값: 원래 제목
  return event.title;
}

interface EventsSidebarProps {
  events: Event[];
}

export default function EventsSidebar({ events }: EventsSidebarProps) {
  const topEvents = events.slice(0, 5);

  if (topEvents.length === 0) {
    return null;
  }

  return (
    <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0 sticky top-20 h-fit">
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900">📅 다가오는 경제일정</h3>
        </div>
        
        <div className="space-y-3">
          {topEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{event.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {getCompanyName(event)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(event.date)}
                    {event.time && ` · ${event.time} KST`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
