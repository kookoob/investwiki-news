-- posts 테이블 RLS 정책 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "누구나 posts 생성" ON posts;
DROP POLICY IF EXISTS "누구나 posts 읽기" ON posts;

-- 새 정책 추가
CREATE POLICY "누구나 posts 읽기" ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "누구나 posts 생성" ON posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "작성자만 posts 수정" ON posts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "작성자만 posts 삭제" ON posts
  FOR DELETE
  USING (true);

-- 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'posts';
