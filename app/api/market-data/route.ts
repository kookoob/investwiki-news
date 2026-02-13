import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = 'd67blf1r01qmckkcr1jgd67blf1r01qmckkcr1k0'

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
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          results[symbol] = { price: '-', change: '-', changePercent: '-' }
          continue
        }

        const data = await response.json()

        if (data.c && data.c > 0) {
          const currentPrice = data.c
          const change = data.d
          const changePercent = data.dp

          const formatPrice = (price: number) => {
            if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            if (price >= 100) return price.toFixed(2)
            if (price >= 1) return price.toFixed(3)
            return price.toFixed(4)
          }

          results[symbol] = {
            price: formatPrice(currentPrice),
            change: change >= 0 ? `+${formatPrice(Math.abs(change))}` : `-${formatPrice(Math.abs(change))}`,
            changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
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
