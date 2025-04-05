// app/[locale]/layout.tsx
// 주석: 각 언어 하위 layout에서 NextIntlClientProvider를 설정합니다.

import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

// 정적 경로 생성 (SSG)
// 예: en, ko, ja 세 개 국어만 우선 적용
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ja' }, { locale: 'ko' }];
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    // public/locales/en/common.json / ja/common.json / ko/common.json
    messages = (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
