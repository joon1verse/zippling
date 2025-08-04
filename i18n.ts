// i18n.ts (네임스페이스 규칙 복구)

import { getRequestConfig, requestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
 
const locales = ['en', 'ko', 'ja'];
 
export default getRequestConfig(async () => {
  const locale = await requestLocale();
 
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: {
      // 사용자 정의 네임스페이스 규칙(PascalCase)을 다시 적용합니다.
      common: (await import(`./public/locales/${locale}/common.json`)).default,
      vancouver: (await import(`./public/locales/${locale}/vancouver.json`)).default,
      MainPage: (await import(`./public/locales/${locale}/main.json`)).default,
      AboutPage: (await import(`./public/locales/${locale}/about.json`)).default,
      ContactPage: (await import(`./public/locales/${locale}/contact.json`)).default,
      AuthPage: (await import(`./public/locales/${locale}/auth.json`)).default,
      HotDealPage: (await import(`./public/locales/${locale}/hotdeal.json`)).default
    },
    locale: locale
  };
});
