// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    // i18n 세팅 (Next.js에서 기본 제공)
    // next-intl을 함께 사용할 경우, 여기서 locales와 defaultLocale만 잡아주고
    // 나머지 로직은 next-intl에 맡기는 형태를 자주 사용합니다.
    i18n: {
      locales: ['en', 'ja', 'ko'],
      defaultLocale: 'en'
    },
    // 필요하다면 기타 설정들
  };
  
  export default nextConfig;
  