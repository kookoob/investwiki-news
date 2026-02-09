-- 북마크 테이블 생성
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'news' 또는 'post'
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- RLS 정책
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "누구나 bookmarks 읽기" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "누구나 bookmarks 생성" ON bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "누구나 bookmarks 삭제" ON bookmarks FOR DELETE USING (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_item ON bookmarks(item_type, item_id);
