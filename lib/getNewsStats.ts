import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface NewsStats {
  bullish: number
  bearish: number
  comments: number
}

export async function getNewsStats(newsId: string): Promise<NewsStats> {
  try {
    // 투표 수 조회
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('news_id', newsId)

    const bullish = votes?.filter(v => v.vote_type === 'bullish').length || 0
    const bearish = votes?.filter(v => v.vote_type === 'bearish').length || 0

    // 댓글 수 조회
    const { count: comments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('news_id', newsId)

    return {
      bullish,
      bearish,
      comments: comments || 0
    }
  } catch (error) {
    return {
      bullish: 0,
      bearish: 0,
      comments: 0
    }
  }
}

export async function getAllNewsStats(newsIds: string[]): Promise<Record<string, NewsStats>> {
  const stats: Record<string, NewsStats> = {}
  
  // 병렬로 모든 뉴스 통계 가져오기
  await Promise.all(
    newsIds.map(async (id) => {
      stats[id] = await getNewsStats(id)
    })
  )
  
  return stats
}
