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
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          cache: 'no-store' // 캐시 비활성화 (실시간 데이터)
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

          // 지수인지 확인 (^로 시작하거나 .SS로 끝남 = 주가지수)
          const isIndex = symbol.startsWith('^') || symbol.endsWith('.SS')
          
          // 환율 기호 매핑
          const currencySymbols: Record<string, string> = {
            'KRW=X': '₩',      // 달러/원
            'EURUSD=X': '€',   // 유로/달러
            'JPY=X': '¥',      // 달러/엔
            'GBPUSD=X': '£',   // 파운드/달러
          }
          
          const isForex = currencySymbols[symbol]
          const forexSymbol = currencySymbols[symbol] || '$'

          // 변동률 포맷팅 (0이 아닐 때만 +/- 기호)
          let formattedChangePercent
          if (Math.abs(changePercent) < 0.01) {
            formattedChangePercent = '0.00%'
          } else if (changePercent > 0) {
            formattedChangePercent = `+${changePercent.toFixed(2)}%`
          } else {
            formattedChangePercent = `${changePercent.toFixed(2)}%`
          }

          results[symbol] = {
            price: isIndex ? formatPrice(currentPrice) : isForex ? `${forexSymbol}${formatPrice(currentPrice)}` : `$${formatPrice(currentPrice)}`,
            change: change >= 0 ? `+${formatPrice(Math.abs(change))}` : `-${formatPrice(Math.abs(change))}`,
            changePercent: formattedChangePercent,
          }
        } else {
          results[symbol] = { price: '-', change: '-', changePercent: '-' }
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
