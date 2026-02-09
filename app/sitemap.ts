import { MetadataRoute } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://stockhub.kr'
  
  // 뉴스 데이터 읽기
  let newsItems = []
  try {
    const filePath = path.join(process.cwd(), 'public', 'news.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    newsItems = JSON.parse(fileContents)
  } catch (error) {
    console.error('Error reading news.json:', error)
  }

  // 기본 페이지
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/rss`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ]

  // 뉴스 페이지들
  const newsRoutes = newsItems.map((item: any) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: new Date(item.date),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...routes, ...newsRoutes]
}
