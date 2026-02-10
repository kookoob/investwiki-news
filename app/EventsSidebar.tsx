import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  link: string;
  date: string;
  time: string | null;
  emoji: string;
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

interface EventsSidebarProps {
  events: Event[];
}

export default function EventsSidebar({ events }: EventsSidebarProps) {
  const topEvents = events.slice(0, 5);

  if (topEvents.length === 0) {
    return null;
  }

  return (
    <aside className="block sticky top-20 h-fit">
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">📅 다가오는 경제일정</h3>
          <Link href="/events" className="text-xs text-blue-600 hover:underline">
            전체 →
          </Link>
        </div>
        
        <div className="space-y-3">
          {topEvents.map((event) => (
            <a
              key={event.id}
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{event.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(event.date)}
                    {event.time && ` · ${event.time}`}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
