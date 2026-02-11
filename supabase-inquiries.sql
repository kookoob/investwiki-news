-- 문의사항 테이블 (이미 있을 수 있음)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- RLS 비활성화 (관리자만 접근)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 문의 작성 가능
CREATE POLICY "Anyone can insert inquiries"
  ON inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 관리자만 조회 가능
CREATE POLICY "Admin can view all inquiries"
  ON inquiries
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'kyongg02@gmail.com'
  );

-- 관리자만 업데이트 가능
CREATE POLICY "Admin can update inquiries"
  ON inquiries
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'kyongg02@gmail.com'
  );

-- 관리자만 삭제 가능
CREATE POLICY "Admin can delete inquiries"
  ON inquiries
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'kyongg02@gmail.com'
  );
