# Google Analytics 4 설정 가이드

## 1. GA4 계정 생성 및 측정 ID 발급

### 단계:
1. https://analytics.google.com 접속
2. "측정 시작" 클릭
3. 계정 이름: `StockHub`
4. 속성 이름: `StockHub - 웹사이트`
5. 업종: `뉴스 및 미디어`
6. 웹사이트 URL: `https://stockhub.kr`
7. 측정 ID 복사 (형식: `G-XXXXXXXXXX`)

## 2. .env.local 파일에 추가

```env
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 3. Vercel 환경변수 추가

1. Vercel Dashboard → Settings → Environment Variables
2. 변수명: `NEXT_PUBLIC_GA_ID`
3. 값: `G-XXXXXXXXXX`
4. 환경: Production, Preview, Development 모두 체크
5. Save

## 4. 배포 및 확인

```bash
npm run build
npm run start
```

또는 Vercel에 자동 배포 후:
- Google Analytics에서 실시간 트래픽 확인
- 24시간 후 상세 리포트 확인 가능

## 5. 확인 사항

✅ GA4 대시보드에서 실시간 사용자 확인
✅ 페이지뷰 추적 확인
✅ 이벤트 추적 확인

---

**참고:** 데이터 수집 시작까지 최대 24시간 소요될 수 있습니다.
