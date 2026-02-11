import { promises as fs } from 'fs'
import path from 'path'

export interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// 한글 매핑 캐시
let koreanStocksMap: Record<string, string> | null = null

// 한국 주식 한글 이름 로드
async function loadKoreanStocksMap() {
  if (koreanStocksMap) return koreanStocksMap
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'korean-stocks.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const mapping = JSON.parse(fileContents)
    
    // 역방향 매핑 생성 (티커 → 이름)
    koreanStocksMap = {}
    for (const [name, ticker] of Object.entries(mapping)) {
      // 대문자 버전만 사용 (중복 제거)
      if (name === name.toUpperCase() || !name.match(/[A-Z]/)) {
        koreanStocksMap[ticker as string] = name
      }
    }
    
    return koreanStocksMap
  } catch (error) {
    console.error('한국 주식 매핑 로드 실패:', error)
    return {}
  }
}

// 티커별 한글 이름 매핑 (기본값 - JSON 로드 실패 시 사용)
const TICKER_NAMES: Record<string, string> = {
  // 지수
  '^DJI': '다우존스',
  '^GSPC': 'S&P 500',
  '^IXIC': '나스닥',
  '^KS11': 'KOSPI',
  '^KQ11': 'KOSDAQ',
  
  // 암호화폐
  'BTC-USD': '비트코인',
  'ETH-USD': '이더리움',
  
  // 미국 주식
  'GS': '골드만삭스',
  'SQ': 'Block (Square)',
  'AAPL': '애플',
  'TSLA': '테슬라',
  'MSFT': '마이크로소프트',
  'GOOGL': '구글',
  'AMZN': '아마존',
  'NVDA': '엔비디아',
  'META': '메타',
  'NFLX': '넷플릭스',
  'JPM': 'JP모건',
  'BAC': '뱅크오브아메리카',
  'V': '비자',
  'MA': '마스터카드',
  'WMT': '월마트',
  'DIS': '디즈니',
  'INTC': '인텔',
  'AMD': 'AMD',
  'PYPL': '페이팔',
  'ADBE': '어도비',
  'CRM': '세일즈포스',
  'CSCO': '시스코',
  'PFE': '화이자',
  'MRK': '머크',
  'JNJ': '존슨앤존슨',
  'UNH': '유나이티드헬스',
  'XOM': '엑손모빌',
  'CVX': '셰브론',
  'BA': '보잉',
  'CAT': '캐터필러',
  'MMM': '3M',
  'GE': 'GE'
}

export async function fetchTickerPrices(tickers: string[]): Promise<TickerData[]> {
  if (!tickers || tickers.length === 0) return []

  // 한국 주식 매핑 로드
  const koreanMap = await loadKoreanStocksMap()

  try {
    const results = await Promise.all(
      tickers.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
            { next: { revalidate: 60 } } // 1분 캐시
          )
          const json = await res.json()
          const quote = json.chart.result[0]
          const meta = quote.meta
          const currentPrice = meta.regularMarketPrice
          const previousClose = meta.chartPreviousClose
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100

          // 이름 결정 우선순위:
          // 1. 한국 주식 매핑 (korean-stocks.json)
          // 2. 하드코딩 매핑 (TICKER_NAMES)
          // 3. Yahoo Finance API 이름
          let name = koreanMap[symbol] || TICKER_NAMES[symbol] || meta.longName || meta.shortName || symbol

          return {
            symbol,
            name,
            price: currentPrice,
            change,
            changePercent
          }
        } catch (err) {
          console.error(`Failed to fetch ${symbol}:`, err)
          return null
        }
      })
    )

    return results.filter((r): r is TickerData => r !== null)
  } catch (error) {
    console.error('가격 fetch 실패:', error)
    return []
  }
}
