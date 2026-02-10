import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTICES_FILE = path.join(process.cwd(), 'public', 'notices.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function GET() {
  try {
    const data = await fs.readFile(NOTICES_FILE, 'utf-8');
    const notices = JSON.parse(data);
    return NextResponse.json(notices);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, password, pinned } = body;

    // 관리자 비밀번호 확인
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    // 기존 공지사항 읽기
    let notices = [];
    try {
      const data = await fs.readFile(NOTICES_FILE, 'utf-8');
      notices = JSON.parse(data);
    } catch {
      notices = [];
    }

    // 새 공지사항
    const newNotice = {
      id: `notice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      pinned: pinned || false,
      created_at: new Date().toISOString(),
    };

    notices.unshift(newNotice);

    // 파일 저장
    await fs.writeFile(NOTICES_FILE, JSON.stringify(notices, null, 2));

    return NextResponse.json(newNotice);
  } catch (error) {
    console.error('Notice creation error:', error);
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
  }
}
