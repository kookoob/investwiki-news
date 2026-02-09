-- ===================================
-- StockHub 전체 테이블 및 RLS 설정
-- ===================================

-- 1. users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 users 읽기" ON users;
DROP POLICY IF EXISTS "누구나 users 생성" ON users;
CREATE POLICY "누구나 users 읽기" ON users FOR SELECT USING (true);
CREATE POLICY "누구나 users 생성" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "본인만 users 수정" ON users FOR UPDATE USING (true);

-- 2. user_levels 테이블
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  season INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 user_levels 읽기" ON user_levels;
DROP POLICY IF EXISTS "누구나 user_levels 생성" ON user_levels;
DROP POLICY IF EXISTS "누구나 user_levels 수정" ON user_levels;
CREATE POLICY "누구나 user_levels 읽기" ON user_levels FOR SELECT USING (true);
CREATE POLICY "누구나 user_levels 생성" ON user_levels FOR INSERT WITH CHECK (true);
CREATE POLICY "누구나 user_levels 수정" ON user_levels FOR UPDATE USING (true);

-- 3. posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'free',
  likes INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 posts 읽기" ON posts;
DROP POLICY IF EXISTS "누구나 posts 생성" ON posts;
DROP POLICY IF EXISTS "누구나 posts 수정" ON posts;
DROP POLICY IF EXISTS "누구나 posts 삭제" ON posts;
CREATE POLICY "누구나 posts 읽기" ON posts FOR SELECT USING (true);
CREATE POLICY "누구나 posts 생성" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "누구나 posts 수정" ON posts FOR UPDATE USING (true);
CREATE POLICY "누구나 posts 삭제" ON posts FOR DELETE USING (true);

-- 4. post_comments 테이블
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 댓글 읽기" ON post_comments;
DROP POLICY IF EXISTS "누구나 댓글 생성" ON post_comments;
DROP POLICY IF EXISTS "누구나 댓글 수정" ON post_comments;
DROP POLICY IF EXISTS "누구나 댓글 삭제" ON post_comments;
CREATE POLICY "누구나 댓글 읽기" ON post_comments FOR SELECT USING (true);
CREATE POLICY "누구나 댓글 생성" ON post_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "누구나 댓글 수정" ON post_comments FOR UPDATE USING (true);
CREATE POLICY "누구나 댓글 삭제" ON post_comments FOR DELETE USING (true);

-- 5. exp_logs 테이블
CREATE TABLE IF NOT EXISTS exp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exp_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 exp_logs 읽기" ON exp_logs;
DROP POLICY IF EXISTS "누구나 exp_logs 생성" ON exp_logs;
CREATE POLICY "누구나 exp_logs 읽기" ON exp_logs FOR SELECT USING (true);
CREATE POLICY "누구나 exp_logs 생성" ON exp_logs FOR INSERT WITH CHECK (true);

-- 6. bookmarks 테이블
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 bookmarks 읽기" ON bookmarks;
DROP POLICY IF EXISTS "누구나 bookmarks 생성" ON bookmarks;
DROP POLICY IF EXISTS "누구나 bookmarks 삭제" ON bookmarks;
CREATE POLICY "누구나 bookmarks 읽기" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "누구나 bookmarks 생성" ON bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "누구나 bookmarks 삭제" ON bookmarks FOR DELETE USING (true);

-- 7. notices 테이블 (공지사항)
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 notices 읽기" ON notices;
DROP POLICY IF EXISTS "누구나 notices 생성" ON notices;
CREATE POLICY "누구나 notices 읽기" ON notices FOR SELECT USING (true);
CREATE POLICY "누구나 notices 생성" ON notices FOR INSERT WITH CHECK (true);

-- 8. inquiries 테이블 (문의)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "누구나 inquiries 생성" ON inquiries;
DROP POLICY IF EXISTS "누구나 inquiries 읽기" ON inquiries;
CREATE POLICY "누구나 inquiries 생성" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "누구나 inquiries 읽기" ON inquiries FOR SELECT USING (true);

-- 확인
SELECT 
  schemaname, 
  tablename, 
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
