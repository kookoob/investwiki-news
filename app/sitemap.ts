import { MetadataRoute } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://stockhub.kr'
  
  // 모든 뉴스 데이터 읽기 (news.json + news-1.json ~ news-8.json)
  let newsItems: any[] = []
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const newsFiles = ['news.json', 'news-1.json', 'news-2.json', 'news-3.json', 'news-4.json', 'news-5.json', 'news-6.json', 'news-7.json', 'news-8.json']
    
    for (const fileName of newsFiles) {
      try {
        const filePath = path.join(publicDir, fileName)
        const fileContents = await fs.readFile(filePath, 'utf8')
        const items = JSON.parse(fileContents)
        newsItems = [...newsItems, ...items]
      } catch (err) {
        // 파일이 없으면 스킵
        console.log(`Skipping ${fileName}`)
      }
    }
    
    console.log(`Total news items in sitemap: ${newsItems.length}`)
  } catch (error) {
    console.error('Error reading news files:', error)
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
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/notice`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
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
