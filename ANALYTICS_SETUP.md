# StockHub - Google Analytics 설정 가이드

## 📊 현재 상태
- ✅ Vercel Analytics: 활성화됨
- ❌ Google Analytics: 미설정 (NEXT_PUBLIC_GA_ID 누락)

## 🔧 Google Analytics 설정 방법

### 1단계: Google Analytics 계정 생성
1. https://analytics.google.com 접속
2. "측정 시작" 클릭
3. 계정 이름: `StockHub` 입력
4. 속성 이름: `StockHub.kr` 입력
5. 보고 시간대: `대한민국 (GMT+9)`
6. 통화: `KRW (₩)`
7. 업종 카테고리: `뉴스/미디어`
8. 비즈니스 규모: 적절히 선택
9. "만들기" 클릭

### 2단계: 웹 스트림 추가
1. 데이터 스트림 → "웹" 선택
2. 웹사이트 URL: `https://stockhub.kr`
3. 스트림 이름: `StockHub Main`
4. "스트림 만들기" 클릭
5. **측정 ID 복사** (형식: `G-XXXXXXXXXX`)

### 3단계: 환경변수 설정
`.env.local` 파일에 추가:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # 2단계에서 복사한 ID
```

### 4단계: Vercel 환경변수 설정
```bash
cd /Users/ai/.openclaw/workspace/news-app
vercel env add NEXT_PUBLIC_GA_ID
# 값 입력: G-XXXXXXXXXX
# Production, Preview, Development 모두 선택
```

또는 Vercel 대시보드에서:
1. https://vercel.com/dashboard
2. stockhub 프로젝트 → Settings → Environment Variables
3. Key: `NEXT_PUBLIC_GA_ID`
4. Value: `G-XXXXXXXXXX`
5. Production, Preview, Development 체크
6. Save

### 5단계: 배포
```bash
git add .env.local
git commit -m "feat: Google Analytics 설정"
git push origin main
```

또는 Vercel 대시보드에서 Redeploy

---

## 📈 GA4 설정 추천

### 이벤트 추적 (향후 추가 가능)
```typescript
// app/GoogleAnalytics.tsx 수정
import { track } from '@vercel/analytics/react';

// 뉴스 클릭 추적
track('news_click', {
  article_id: 'news_123',
  category: 'stock',
});

// 검색 추적
track('search', {
  search_term: '삼성전자',
});
```

### 맞춤 보고서 설정
1. 탐색 → 보고서
2. "맞춤 보고서" 생성
3. 추천 지표:
   - 페이지뷰 (경로별)
   - 평균 세션 시간
   - 이탈률
   - 유입 소스/매체
   - 디바이스 카테고리

---

## 🔍 Google Search Console 연동

### 1단계: GSC 등록
1. https://search.google.com/search-console
2. "속성 추가" → `https://stockhub.kr`
3. 소유권 확인 (이미 완료됨: `aL-dmCAtmOJFBGBSB7Sxu9K0gQw9WvDy3Srg3unDLn8`)

### 2단계: Sitemap 제출
1. Sitemaps 메뉴
2. `https://stockhub.kr/sitemap.xml` 제출

### 3단계: 색인 상태 확인
- 색인 생성 → 페이지
- 커버리지 보고서 확인
- 크롤링 오류 모니터링

---

## 📊 분석 가능한 데이터 (설정 후)

### Vercel Analytics (현재 가능)
- ✅ 실시간 페이지뷰
- ✅ 방문자 수 (Unique visitors)
- ✅ 지역별 트래픽
- ✅ 디바이스 분포

### Google Analytics (설정 후 가능)
- 📊 사용자 행동 흐름
- 📊 세션 시간 & 이탈률
- 📊 유입 경로 (검색/직접/소셜/추천)
- 📊 페이지별 성과
- 📊 실시간 사용자
- 📊 인구통계 (연령/성별)
- 📊 관심사 카테고리
- 📊 검색어 분석 (GSC 연동 시)

---

## 🚨 중요 참고사항

1. **NEXT_PUBLIC_** 접두사 필수
   - Next.js 클라이언트에서 접근하려면 반드시 `NEXT_PUBLIC_` 접두사 필요

2. **환경변수 재배포 필요**
   - Vercel에서 환경변수 추가 후 반드시 Redeploy 필요

3. **데이터 수집 시작 시간**
   - GA4는 설정 후 24-48시간 후부터 의미있는 데이터 축적

4. **개인정보 보호**
   - IP 익명화 기본 활성화 (GA4)
   - GDPR 준수 설정 확인

---

## 📞 문제 해결

### GA4가 작동하지 않는 경우
1. 브라우저 콘솔에서 `window.gtag` 확인
2. Network 탭에서 `google-analytics.com` 요청 확인
3. 광고 차단기 비활성화 후 재확인
4. 환경변수 오타 확인 (`NEXT_PUBLIC_GA_ID`)

### Vercel Analytics가 작동하지 않는 경우
1. `<Analytics />` 컴포넌트 확인 (layout.tsx에 이미 있음)
2. Vercel 프로젝트 설정에서 Analytics 활성화 확인

---

## ✅ 체크리스트

- [ ] GA4 계정 생성
- [ ] 측정 ID 발급 (G-XXXXXXXXXX)
- [ ] `.env.local`에 NEXT_PUBLIC_GA_ID 추가
- [ ] Vercel 환경변수 설정
- [ ] 배포 (Redeploy)
- [ ] 24시간 후 데이터 확인
- [ ] GSC Sitemap 제출
- [ ] 맞춤 보고서 설정

---

**작성일**: 2026-02-12
**업데이트**: 필요 시 최신화
