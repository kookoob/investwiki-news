import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'public', 'community-posts.json');

export async function GET() {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const posts = JSON.parse(data);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    // 기존 게시글 읽기
    let posts = [];
    try {
      const data = await fs.readFile(POSTS_FILE, 'utf-8');
      posts = JSON.parse(data);
    } catch {
      posts = [];
    }

    // 새 게시글
    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      author: author || '익명',
      views: 0,
      likes: 0,
      comments: [],
      created_at: new Date().toISOString(),
    };

    posts.unshift(newPost);

    // 파일 저장
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));

    return NextResponse.json(newPost);
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
