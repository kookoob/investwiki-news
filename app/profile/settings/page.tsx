import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/profile" className="text-blue-400 hover:underline text-sm">
            ← 프로필로
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-white">앱 화면 설정</h1>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">🌙</div>
            <div>
              <h2 className="font-semibold text-gray-100">다크 모드</h2>
              <p className="text-sm text-gray-400">기본 테마로 적용됨</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            StockHub는 다크 모드가 기본으로 적용되어 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
