import '../globals.css';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Nunito } from 'next/font/google';

// ① generateStaticParams => OK in Server Component
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ko' }, { locale: 'ja' }];
}

// 폰트 설정도 서버에서
const nunito = Nunito({
  weight: ['400', '600', '700'],
  subsets: ['latin']
});

import Header from './header'; // 클라이언트 컴포넌트

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} className={nunito.className}>
      <body className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Header는 클라이언트 컴포넌트 */}
          <Header locale={locale} />

          {/* 메인 */}
          <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
            {children}
          </main>

          {/* Footer (서버 측에서 바로 렌더링, 상태 없음) */}
          <footer className="bg-white text-gray-500 text-center py-4 text-sm">
            © 2025 Zippling Inc. All rights reserved.
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
