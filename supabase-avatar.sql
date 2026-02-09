-- users 테이블에 avatar_url 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 확인
SELECT id, username, email, avatar_url FROM users LIMIT 5;
