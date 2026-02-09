export interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// 티커별 한글 이름 매핑
const TICKER_NAMES: Record<string, string> = {
  '^DJI': '다우존스',
  '^GSPC': 'S&P 500',
  '^IXIC': '나스닥',
  'BTC-USD': '비트코인',
  'ETH-USD': '이더리움',
  'GS': '골드만삭스',
  'SQ': 'Block (Square)',
  'AAPL': '애플',
  'TSLA': '테슬라',
  'MSFT': '마이크로소프트',
  'GOOGL': '구글',
  'AMZN': '아마존',
  'NVDA': '엔비디아'
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
