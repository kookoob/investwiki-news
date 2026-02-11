import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email, subject, content } = await request.json();

    // 환경 변수 체크
    if (!process.env.RESEND_API_KEY) {
      console.error('⚠️  RESEND_API_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error('⚠️  ADMIN_EMAIL이 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'Admin email not configured' },
        { status: 500 }
      );
    }

    // Resend 초기화 (환경 변수 확인 후)
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 관리자에게 이메일 발송
    const { data, error } = await resend.emails.send({
      from: 'StockHub <noreply@stockhub.kr>',
      to: process.env.ADMIN_EMAIL,
      subject: `[StockHub 문의] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📨 새로운 문의가 접수되었습니다</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>보낸 사람:</strong> ${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>제목:</strong> ${subject}</p>
            <p style="margin: 0;"><strong>접수 시간:</strong> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
          </div>

          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">문의 내용:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #4b5563;">${content}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af;">
              💡 <a href="https://stockhub.kr/admin/inquiries" style="color: #2563eb; text-decoration: none; font-weight: bold;">관리자 페이지</a>에서 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('이메일 발송 실패:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('이메일 API 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
