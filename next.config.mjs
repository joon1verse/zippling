// next.config.mjs

// next-intl 플러그인을 가져옵니다.
import withNextIntl from 'next-intl/plugin';

// withNextIntl 플러그인으로 next.js 설정을 감싸줍니다.
// './i18n.ts'는 우리가 생성한 설정 파일의 경로입니다.
const withNextIntlConfig = withNextIntl('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 여기에 기존에 사용하던 Next.js 관련 설정을 넣을 수 있습니다.
  // 예: images, reactStrictMode 등
  images: {
    // 필요한 경우 이미지 관련 설정을 추가합니다.
  },
};

export default withNextIntlConfig(nextConfig);