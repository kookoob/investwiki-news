import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 })
  }
  
  try {
    // Yahoo Finance API 호출
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      next: { revalidate: 30 } // 30초 캐시
    })
    
    if (!response.ok) {
      console.error(`Yahoo Finance API error for ${ticker}: ${response.status}`)
      return NextResponse.json({ error: 'API request failed' }, { status: 404 })
    }
    
    const data = await response.json()
    
    // result 배열 체크
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.error(`No data for ticker: ${ticker}`)
      return NextResponse.json({ error: 'No data available' }, { status: 404 })
    }
    
    const quote = data.chart.result[0]
    const meta = quote.meta
    
    // 필수 데이터 체크
    if (!meta || typeof meta.regularMarketPrice !== 'number' || typeof meta.chartPreviousClose !== 'number') {
      console.error(`Invalid data structure for ${ticker}`)
      return NextResponse.json({ error: 'Invalid data' }, { status: 404 })
    }
    
    const currentPrice = meta.regularMarketPrice
    const previousClose = meta.chartPreviousClose
    
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100
    
    // 한국 주식(.KS, .KQ)인 경우 KRW, 나머지는 USD
    const isKoreanStock = ticker.endsWith('.KS') || ticker.endsWith('.KQ')
    const currency = isKoreanStock ? 'KRW' : meta.currency || 'USD'
    
    return NextResponse.json({
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      currency: currency
    })
  } catch (error) {
    console.error(`Stock price fetch error for ${ticker}:`, error)
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 })
  }
}
