# SEO & 분석 도구 확인 체크리스트

## ✅ 완료된 작업

### 1. **구조화 데이터 (Schema.org)**
- ✅ NewsArticle Schema 추가 완료
- ✅ BreadcrumbList Schema 추가 완료
- ✅ Publisher/Author 정보 포함
- ✅ JSON-LD 형식으로 구현

### 2. **이미지 최적화**
- ✅ Next.js Image 최적화 설정 (AVIF, WebP)
- ✅ 반응형 이미지 크기 설정
- ✅ 캐시 최적화 (60초 TTL)

### 3. **폰트 최적화**
- ✅ Next.js 자동 폰트 최적화 활성화
- ✅ Geist Sans/Mono 폰트 사용

### 4. **성능 최적화**
- ✅ Gzip 압축 활성화
- ✅ 프로덕션 소스맵 비활성화
- ✅ ISR (60초 재검증) 적용

---

## 📊 확인이 필요한 도구들

### 1. Google Search Console
**URL:** https://search.google.com/search-console

**확인 사항:**
- [ ] 색인 생성 상태 (Coverage 탭)
- [ ] 검색 실적 (Performance 탭)
- [ ] 사이트맵 제출 확인
- [ ] 모바일 사용성 오류 확인
- [ ] Core Web Vitals 점수

**권장 작업:**
- 주요 키워드: `미국주식`, `투자뉴스`, `경제뉴스`, `AI 뉴스 요약`
- URL 검사로 새 뉴스 즉시 색인 요청

---

### 2. Naver Search Advisor
**URL:** https://searchadvisor.naver.com

**확인 사항:**
- [ ] 검색 노출 통계
- [ ] 키워드 분석
- [ ] 사이트 오류 확인
- [ ] RSS 피드 제출

---

### 3. Google AdSense
**URL:** https://www.google.com/adsense

**확인 사항:**
- [ ] 승인 상태 확인 (MEMORY.md: 심사 대기 중)
- [ ] 수익 대시보드
- [ ] ads.txt 파일 추가 필요 (승인 후)

**승인 후 작업:**
```
# public/ads.txt 파일 생성
google.com, pub-1539404481334883, DIRECT, f08c47fec0942fa0
```

---

### 4. Vercel Analytics
**URL:** https://vercel.com/[your-team]/[project]/analytics

**확인 사항:**
- [ ] 페이지뷰 통계
- [ ] Web Vitals (LCP, FID, CLS)
- [ ] 실시간 방문자 수
- [ ] 지역별 트래픽

**참고:** 이미 `<Analytics />` 컴포넌트 설치 완료

---

### 5. Google Analytics 4
**설정 가이드:** `GOOGLE_ANALYTICS_SETUP.md` 참고

**확인 사항:**
- [ ] 측정 ID 발급 (`G-XXXXXXXXXX`)
- [ ] `.env.local`에 추가
- [ ] Vercel 환경변수 추가
- [ ] 실시간 트래픽 확인
- [ ] 전환 이벤트 설정

---

## 🎯 추가 권장 사항

### 1. **SEO 모니터링**
- Google Trends로 키워드 트렌드 분석
- 경쟁사이트 분석 (Similar Web, Ahrefs)

### 2. **성능 모니터링**
- PageSpeed Insights 정기 확인
- Lighthouse 점수 (90+ 목표)

### 3. **콘텐츠 SEO**
- 각 뉴스 메타 디스크립션 최적화 (완료)
- 이미지 alt 태그 추가
- 내부 링크 구조 강화

### 4. **소셜 미디어 연동**
- Open Graph 이미지 커스터마이징
- Twitter Card 대형 이미지 활용

---

## 📈 월간 체크리스트

**매주:**
- [ ] Search Console 검색 실적 확인
- [ ] GA4 트래픽 분석
- [ ] AdSense 수익 확인 (승인 후)

**매월:**
- [ ] Core Web Vitals 점검
- [ ] 페이지 로딩 속도 테스트
- [ ] 깨진 링크 확인
- [ ] 사이트맵 업데이트 확인

**분기별:**
- [ ] SEO 키워드 전략 재평가
- [ ] 경쟁사 분석
- [ ] 구조화 데이터 검증

---

**최종 업데이트:** 2026-02-11
