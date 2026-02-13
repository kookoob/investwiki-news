'use client'

interface MiniChartProps {
  data: number[]
  color: 'red' | 'blue' | 'gray'
  width?: number
  height?: number
}

export default function MiniChart({ data, color, width = 80, height = 30 }: MiniChartProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const colorMap = {
    red: '#ef4444',
    blue: '#3b82f6',
    gray: '#9ca3af'
  }

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
