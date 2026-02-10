import { supabase } from './supabase';

// 포인트 지급 함수
export async function awardPoints(userId: string, amount: number, reason: string) {
  try {
    // user_levels 테이블에서 현재 포인트 가져오기
    const { data: levelData } = await supabase
      .from('user_levels')
      .select('exp, level')
      .eq('user_id', userId)
      .single();

    let currentExp = levelData?.exp || 0;
    let currentLevel = levelData?.level || 1;
    
    // 포인트 추가
    currentExp += amount;
    
    // 레벨업 체크 (100포인트마다 레벨업)
    const expNeeded = Math.floor(100 * Math.pow(1.1, currentLevel - 1));
    if (currentExp >= expNeeded) {
      currentLevel += 1;
      // 레벨업 시 초과 경험치는 다음 레벨로
      currentExp = currentExp - expNeeded;
    }
    
    // user_levels 업데이트 또는 생성
    const { error } = await supabase
      .from('user_levels')
      .upsert({
        user_id: userId,
        exp: currentExp,
        level: currentLevel,
        season: 1,
      }, {
        onConflict: 'user_id'
      });
    
    if (error) throw error;
    
    console.log(`✅ 포인트 지급: ${userId} +${amount} (이유: ${reason})`);
    return true;
  } catch (error) {
    console.error('포인트 지급 실패:', error);
    return false;
  }
}

// 포인트 지급 타입
export const POINT_REWARDS = {
  COMMUNITY_POST: 5,      // 커뮤니티 글 작성
  COMMENT: 1,             // 댓글 작성 (커뮤니티/뉴스)
  NEWS_VOTE: 1,           // 뉴스 투표 참여
} as const;
