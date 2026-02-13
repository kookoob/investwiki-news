import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || []

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
  }

  try {
    const results: Record<string, any> = {}

    // Binance API (암호화폐만, 무료, 인증 불필요)
    const cryptoSymbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD']
    const binanceMap: Record<string, string> = {
      'BTC-USD': 'BTCUSDT',
      'ETH-USD': 'ETHUSDT',
      'SOL-USD': 'SOLUSDT',
      'BNB-USD': 'BNBUSDT',
    }

    for (const symbol of symbols) {
      if (cryptoSymbols.includes(symbol)) {
        try {
          const binanceSymbol = binanceMap[symbol]
          const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`
          const response = await fetch(url)
          
          if (response.ok) {
            const data = await response.json()
            const price = parseFloat(data.lastPrice)
            const change = parseFloat(data.priceChange)
            const changePercent = parseFloat(data.priceChangePercent)

            const formatPrice = (p: number) => {
              if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              if (p >= 100) return p.toFixed(2)
              if (p >= 1) return p.toFixed(3)
              return p.toFixed(4)
            }

            results[symbol] = {
              price: formatPrice(price),
              change: change >= 0 ? `+${formatPrice(Math.abs(change))}` : `-${formatPrice(Math.abs(change))}`,
              changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
            }
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error)
          results[symbol] = { price: '-', change: '-', changePercent: '-' }
        }
      } else {
        // 다른 심볼은 일단 placeholder
        results[symbol] = { price: '-', change: '-', changePercent: '-' }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Market data fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
