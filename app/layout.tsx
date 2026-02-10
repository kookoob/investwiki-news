import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationHandler from "./NotificationHandler";
import GoogleAnalytics from "./GoogleAnalytics";
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockHub - 실시간 투자·경제 뉴스",
  description: "AI가 엄선한 글로벌 투자 뉴스. Reuters, Bloomberg, WSJ 등 주요 외신을 실시간 번역·요약. 미국주식, 코인, 경제 속보를 30분마다 업데이트.",
  keywords: ["미국주식", "투자뉴스", "경제뉴스", "주식속보", "코인뉴스", "블룸버그", "로이터", "WSJ", "실시간뉴스"],
  authors: [{ name: "StockHub" }],
  creator: "StockHub",
  publisher: "StockHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StockHub"
  },
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "StockHub - 실시간 투자·경제 뉴스",
    description: "AI가 엄선한 글로벌 투자 뉴스",
    url: "https://stockhub.kr",
    siteName: "StockHub",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://stockhub.kr/logo.png",
        width: 1280,
        height: 698,
        alt: "StockHub 로고",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StockHub - 실시간 투자·경제 뉴스",
    description: "AI가 엄선한 글로벌 투자 뉴스",
    creator: "@kimyg002",
    images: ["https://stockhub.kr/logo.png"],
  },
  alternates: {
    canonical: "https://stockhub.kr",
    types: {
      'application/rss+xml': 'https://stockhub.kr/rss',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="google-site-verification" content="aL-dmCAtmOJFBGBSB7Sxu9K0gQw9WvDy3Srg3unDLn8" />
        <meta name="naver-site-verification" content="846a9ed4c727ca52c2a22402746a29070f83ed50" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1539404481334883"
          crossOrigin="anonymous"
        />
        {/* 다크모드 초기화 (깜빡임 방지) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const darkMode = localStorage.getItem('darkMode') === 'true';
                if (darkMode) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <NotificationHandler />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
