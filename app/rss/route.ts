import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'news.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const news = JSON.parse(fileContents)

    const baseUrl = 'https://stockhub.kr'
    const buildDate = new Date().toUTCString()

    const rssItems = news.slice(0, 50).map((item: any) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${baseUrl}/news/${item.id}</link>
      <guid isPermaLink="true">${baseUrl}/news/${item.id}</guid>
      <description><![CDATA[${item.summary || item.title}]]></description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <source>${item.source}</source>
      ${item.tickers && item.tickers.length > 0 ? `<category>${item.tickers.join(', ')}</category>` : ''}
    </item>`).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>StockHub - 실시간 투자·경제 뉴스</title>
    <link>${baseUrl}</link>
    <description>투자자를 위한 실시간 글로벌 뉴스 허브</description>
    <language>ko</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // 30분 캐시
      },
    })
  } catch (error) {
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
