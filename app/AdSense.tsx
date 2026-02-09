'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdSenseProps {
  slot: string
  format?: string
  responsive?: boolean
}

export default function AdSense({ slot, format = 'auto', responsive = true }: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ADSENSE_ID) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  // 애드센스 승인 전: 자리만 표시
  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) {
    return (
      <div className="my-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        <p className="text-sm">광고 영역 (승인 대기 중)</p>
      </div>
    )
  }

  return (
    <div className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}
