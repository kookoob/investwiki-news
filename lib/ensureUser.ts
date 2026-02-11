import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/**
 * 사용자가 users 테이블에 존재하는지 확인하고, 없으면 생성
 */
export async function ensureUserExists(user: User): Promise<void> {
  if (!user) return;

  try {
    // users 테이블에 사용자 존재 여부 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    // 이미 존재하면 종료
    if (existingUser) return;

    // 에러가 발생했지만 "not found"가 아니면 로그만 남기고 종료
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('User check error:', checkError);
      return;
    }

    // 사용자 정보 생성
    const username = user.user_metadata?.name || user.email?.split('@')[0] || 'user';
    const displayName = user.user_metadata?.name || user.email?.split('@')[0] || '사용자';

    const { error: insertError } = await supabase.from('users').insert([{
      id: user.id,
      email: user.email,
      username: username,
      display_name: displayName,
      created_at: new Date().toISOString()
    }]);

    if (insertError) {
      // 중복 키 에러는 무시 (동시 삽입 시 발생 가능)
      if (insertError.code !== '23505') {
        console.error('User creation error:', insertError);
      }
    } else {
      console.log('✅ User created in users table:', user.id);
    }
  } catch (error) {
    console.error('ensureUserExists error:', error);
  }
}
