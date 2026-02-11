/**
 * 보안 유틸리티 함수
 */

/**
 * XSS 방지를 위한 HTML 태그 제거
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * SQL Injection 방지를 위한 특수문자 검증
 * (Supabase는 자동으로 방어하지만 추가 검증)
 */
export function validateInput(input: string, maxLength: number = 10000): boolean {
  if (input.length > maxLength) return false;
  
  // 위험한 패턴 체크
  const dangerousPatterns = [
    /(\bDROP\b|\bDELETE\b|\bTRUNCATE\b|\bEXEC\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /<script[\s\S]*?<\/script>/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * 비밀번호 강도 검증
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 최소 8자 이상이어야 합니다' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (strengthCount < 3) {
    return { 
      valid: false, 
      message: '비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다' 
    };
  }

  return { valid: true, message: '' };
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

/**
 * Rate Limiting (클라이언트 측 기본 방어)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * 서버 사이드 Rate Limiting (API 호출)
 */
export async function checkServerRateLimit(
  key: string, 
  maxRequests: number = 5, 
  windowMs: number = 300000
): Promise<{ allowed: boolean; error?: string; retryAfter?: number }> {
  try {
    const response = await fetch('/api/rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, maxRequests, windowMs })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Server rate limit check failed:', error);
    return { allowed: true }; // 서버 오류 시 허용 (fail-open)
  }
}

/**
 * 사용자 이름 검증 (XSS 방지)
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
  // 길이 체크
  if (username.length < 2 || username.length > 20) {
    return { valid: false, message: '사용자 이름은 2-20자여야 합니다' };
  }

  // 허용된 문자만 (영문, 숫자, 한글, 언더스코어, 하이픈)
  const validPattern = /^[a-zA-Z0-9가-힣_-]+$/;
  if (!validPattern.test(username)) {
    return { valid: false, message: '사용자 이름은 영문, 숫자, 한글, _, - 만 사용 가능합니다' };
  }

  return { valid: true, message: '' };
}

/**
 * 파일 업로드 검증
 */
export function validateImageFile(file: File): { valid: boolean; message: string } {
  // MIME 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: '지원하지 않는 이미지 형식입니다. (jpg, png, gif, webp만 가능)' };
  }

  // 파일 크기 제한 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, message: '이미지 크기는 5MB 이하여야 합니다' };
  }

  // 파일명 검증 (경로 탐색 방지)
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, message: '잘못된 파일명입니다' };
  }

  return { valid: true, message: '' };
}

/**
 * 관리자 권한 체크
 */
export function isAdmin(email: string | undefined): boolean {
  const adminEmails = ['kyongg02@gmail.com'];
  return email ? adminEmails.includes(email.toLowerCase()) : false;
}
