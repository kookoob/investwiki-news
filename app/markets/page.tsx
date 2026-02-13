import Header from '../components/Header'

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📊 시장 지표
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            세계 주요 지수, 환율, 원자재, 암호화폐 실시간 시세
          </p>
        </div>

        {/* 주가지수 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">주가지수</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <iframe
              src="https://www.widgets.investing.com/top-indices?theme=darkTheme&roundedCorners=true"
              width="100%"
              height="400"
              frameBorder={0}
              allowTransparency
              scrolling="no"
            />
          </div>
        </div>

        {/* 환율 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">환율</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <iframe
              src="https://www.widgets.investing.com/live-currency-cross-rates?theme=darkTheme&pairs=1,3,2,4,7,5,8,6,9,10,11,12"
              width="100%"
              height="400"
              frameBorder={0}
              allowTransparency
              scrolling="no"
            />
          </div>
        </div>

        {/* 원자재 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">원자재</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <iframe
              src="https://www.widgets.investing.com/commodities?theme=darkTheme&roundedCorners=true"
              width="100%"
              height="400"
              frameBorder={0}
              allowTransparency
              scrolling="no"
            />
          </div>
        </div>

        {/* 암호화폐 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">암호화폐</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <iframe
              src="https://www.widgets.investing.com/crypto-currency-rates?theme=darkTheme&pairs=1057391,1061443,1010801,1020132"
              width="100%"
              height="400"
              frameBorder={0}
              allowTransparency
              scrolling="no"
            />
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          시세는 Investing.com에서 제공됩니다. 실시간 업데이트됩니다.
        </div>
      </div>
    </div>
  )
}
