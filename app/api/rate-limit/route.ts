import { NextResponse } from 'next/server';

// 간단한 인메모리 Rate Limiter (Vercel Edge에서 작동)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// 오래된 항목 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 60000); // 1분마다

export async function POST(request: Request) {
  try {
    const { key, maxRequests = 5, windowMs = 300000 } = await request.json();

    if (!key) {
      return NextResponse.json({ allowed: false, error: 'Key required' }, { status: 400 });
    }

    const now = Date.now();
    const record = rateLimit.get(key);

    // 새 키이거나 시간 윈도우가 지난 경우
    if (!record || now > record.resetTime) {
      rateLimit.set(key, { count: 1, resetTime: now + windowMs });
      return NextResponse.json({ allowed: true, remaining: maxRequests - 1 });
    }

    // 제한 초과
    if (record.count >= maxRequests) {
      return NextResponse.json({ 
        allowed: false, 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      }, { status: 429 });
    }

    // 카운트 증가
    record.count++;
    return NextResponse.json({ allowed: true, remaining: maxRequests - record.count });

  } catch (error) {
    console.error('Rate limit error:', error);
    return NextResponse.json({ allowed: true }, { status: 200 }); // 실패 시 허용 (fail-open)
  }
}

// GET 요청으로 현재 상태 확인 (디버깅용)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 });
  }

  const record = rateLimit.get(key);
  if (!record) {
    return NextResponse.json({ count: 0, resetTime: null });
  }

  return NextResponse.json({
    count: record.count,
    resetTime: new Date(record.resetTime).toISOString(),
    remaining: Math.max(0, 5 - record.count)
  });
}
