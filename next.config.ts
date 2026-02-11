import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // 성능 최적화
  compress: true,
  
  // 프로덕션 소스맵 비활성화 (성능 향상)
  productionBrowserSourceMaps: false,
  
  // 번들 분석 활성화 (필요시)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = { fs: false, net: false, tls: false };
  //   }
  //   return config;
  // },
};

export default nextConfig;
