import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || []

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
  }

  try {
    const results: Record<string, any> = {}

    for (const symbol of symbols) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 60 } // 1분 캐시
        })

        if (!response.ok) {
          results[symbol] = { price: '-', change: '-', changePercent: '-' }
          continue
        }

        const data = await response.json()
        const quote = data?.chart?.result?.[0]
        const meta = quote?.meta

        if (meta && meta.regularMarketPrice) {
          const currentPrice = meta.regularMarketPrice
          const previousClose = meta.chartPreviousClose || meta.previousClose
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100

          const formatPrice = (price: number) => {
            if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            if (price >= 100) return price.toFixed(2)
            if (price >= 1) return price.toFixed(3)
            return price.toFixed(4)
          }

          // 과거 가격 데이터 추출 (미니차트용)
          const closePrices = quote?.indicators?.quote?.[0]?.close || []
          const chartData = closePrices.filter((p: number) => p !== null && p !== undefined && p > 0)

          results[symbol] = {
            price: `$${formatPrice(currentPrice)}`,
            change: change >= 0 ? `+${formatPrice(Math.abs(change))}` : `-${formatPrice(Math.abs(change))}`,
            changePercent: change >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
            chartData: chartData.length > 0 ? chartData : [previousClose, currentPrice],
          }
        } else {
          results[symbol] = { price: '-', change: '-', changePercent: '-', chartData: [] }
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error)
        results[symbol] = { price: '-', change: '-', changePercent: '-' }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Market data fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
