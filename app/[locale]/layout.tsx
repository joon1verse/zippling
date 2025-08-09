// app/[locale]/layout.tsx

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Script from "next/script";
import HeaderWithTopbar from "./header_with_topbar";
import { getCanonical, getAlternateLanguages, toAbsolute } from '@util/localeMap';

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "common.Metadata" });
  const og = await getTranslations({ locale, namespace: "common.Metadata.openGraph" });

  // [참고] metadataBase는 그대로 두어도 무방하나, canonical은 절대경로로 직접 지정
  const siteUrl = new URL("https://zippling.net");

  return {
    metadataBase: siteUrl,
    title: t('title'),
    description: t('description'),
    robots: { index: true, follow: true },

    // [SEO FIX] canonical/alternates 절대경로
    alternates: {
      canonical: getCanonical(locale, ''),          // ex) https://zippling.net/ko
      languages: getAlternateLanguages(''),         // ex) { 'ko-KR': 'https://zippling.net/ko', ... }
    },

    // [권장] OG url 절대경로
    openGraph: {
      title: og('title'),
      description: og('description'),
        url: getCanonical(locale, ''),                 // 루트는 /{locale}
        images: [
          {
            url: toAbsolute(og('imageUrl')),          // [수정] 이중 도메인 방지
            width: 1200,
            height: 630,
            alt: 'Zippling 로고'
          }
        ],
      locale: locale === 'ko' ? 'ko_KR' : (locale === 'ja' ? 'ja_JP' : 'en_CA'),
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: og('title'),
      description: og('description'),
      images: [toAbsolute(og('imageUrl'))],            // [권장] 절대경로
    },
  };
}

/**
 * 뷰포트 설정을 정의합니다.
 */
export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
  };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = useMessages();
  
  // SessionProvider 래퍼를 제거합니다.
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col min-h-screen">
        <HeaderWithTopbar locale={locale} />
        <main className="flex-grow bg-white">
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center py-6 text-sm">
          © 2025 Zippling Inc. All rights reserved.
        </footer>
        <Script
          id="google-adsense"
          strategy="afterInteractive"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      </div>
    </NextIntlClientProvider>
  );
}