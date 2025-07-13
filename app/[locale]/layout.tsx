// app/[locale]/layout.tsx

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Script from "next/script";
import HeaderWithTopbar from "./header_with_topbar";


/**
 * 사이트의 기본 메타데이터를 생성합니다.
 * 이 메타데이터는 하위 페이지에서 별도로 메타데이터를 정의하지 않았을 때 사용됩니다.
 * 하위 페이지에서 generateMetadata를 정의하면 이 설정값을 덮어쓰게 됩니다.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // [핵심] 직접 파일을 import하는 대신, i18n.ts를 통해 getTranslations를 사용합니다.
  // 기본 메타데이터는 common.json에 정의된 'Metadata' 네임스페이스에서 가져옵니다.
  const t = await getTranslations({ locale, namespace: "common.Metadata" });
  const og = await getTranslations({ locale, namespace: "common.Metadata.openGraph" });
  
  const siteUrl = new URL("https://zippling.net");

  return {
    metadataBase: siteUrl,
    title: t('title'),
    description: t('description'),
    
    // SEO 설정
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}`,
      languages: { "en-CA": "/en", "ko-KR": "/ko", "ja-JP": "/ja" },
    },
    
    // 소셜 미디어 공유(Open Graph) 설정
    openGraph: {
      title: og('title'),
      description: og('description'),
      url: siteUrl,
      siteName: "Zippling",
      images: [
        { 
          url: og('imageUrl'), // common.json에서 가져온 이미지 URL
          width: 1200, 
          height: 630, 
          alt: "Zippling 로고" 
        }
      ],
      locale: locale === 'ko' ? 'ko_KR' : (locale === 'ja' ? 'ja_JP' : 'en_CA'),
      type: "website",
    },
    
    // 트위터 공유 설정
    twitter: {
      card: "summary_large_image",
      title: og('title'),
      description: og('description'),
      images: [og('imageUrl')],
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