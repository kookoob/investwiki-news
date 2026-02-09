-- 관리자 권한 설정
-- Supabase SQL Editor에서 실행하세요

-- 1. users 테이블에 email 컬럼 추가 (없는 경우)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. 관리자 계정 email 설정
-- 닉네임이 "익명"인 사용자를 관리자로 설정
UPDATE users 
SET email = 'kyongg02@gmail.com' 
WHERE username = '익명' OR id = (
  SELECT id FROM users WHERE username ILIKE '%kyong%' LIMIT 1
);

-- 또는 직접 user_id를 지정
-- UPDATE users SET email = 'kyongg02@gmail.com' WHERE id = 'YOUR_USER_ID';

-- 3. 확인
SELECT id, username, email, created_at FROM users WHERE email IS NOT NULL;
