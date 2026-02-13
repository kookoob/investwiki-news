'use client'

interface MiniChartProps {
  data: number[]
  color: 'green' | 'red' | 'gray'
  width?: number
  height?: number
}

export default function MiniChart({ data, color, width = 280, height = 50 }: MiniChartProps) {
  if (!data || data.length < 2) {
    console.log('MiniChart: 데이터 부족', data)
    return null
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min

  // 범위가 너무 작으면 (변동 거의 없음) null 반환
  if (range < 0.01) {
    console.log('MiniChart: 범위 너무 작음', { min, max, range })
    return null
  }

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const colorMap = {
    green: '#22c55e',
    red: '#ef4444',
    gray: '#9ca3af'
  }

  return (
    <svg 
      className="w-full h-auto" 
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
