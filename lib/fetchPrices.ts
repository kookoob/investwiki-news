export interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// 티커별 한글 이름 매핑
const TICKER_NAMES: Record<string, string> = {
  // 지수
  '^DJI': '다우존스',
  '^GSPC': 'S&P 500',
  '^IXIC': '나스닥',
  
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
  
  // 한국 주식 (KOSPI - .KS)
  '005930.KS': '삼성전자',
  '000660.KS': 'SK하이닉스',
  '035420.KS': '네이버',
  '035720.KS': '카카오',
  '005380.KS': '현대차',
  '373220.KS': 'LG에너지솔루션',
  '000270.KS': '기아',
  '051910.KS': 'LG화학',
  '006400.KS': '삼성SDI',
  '207940.KS': '삼성바이오로직스',
  '005490.KS': 'POSCO홀딩스',
  '068270.KS': '셀트리온',
  '028260.KS': '삼성물산',
  '105560.KS': 'KB금융',
  '055550.KS': '신한지주',
  
  // 한국 주식 (KOSDAQ - .KQ)
  '036570.KQ': '엔씨소프트',
  '086520.KQ': '에코프로',
  '247540.KQ': '에코프로비엠',
  '293490.KQ': '카카오게임즈',
  '112040.KQ': '위메이드',
  '251270.KQ': '넷마블',
  '041510.KQ': 'SM엔터테인먼트',
  '035900.KQ': 'JYP Ent.',
  '122870.KQ': 'YG엔터테인먼트'
}

export async function fetchTickerPrices(tickers: string[]): Promise<TickerData[]> {
  if (!tickers || tickers.length === 0) return []

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

          return {
            symbol,
            name: TICKER_NAMES[symbol] || meta.longName || meta.shortName || symbol,
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
