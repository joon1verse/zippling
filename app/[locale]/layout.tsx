// app/[locale]/layout.tsx

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import Script from "next/script";
import HeaderWithTopbar from "./header_with_topbar";

// 동적 메타데이터 생성은 이제 언어별 레이아웃이 담당합니다.
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  let messages;
  try {
    // 1. 해당 언어의 번역 파일을 불러옵니다.
    messages = (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch (error) {
    messages = {}; // 파일이 없으면 빈 객체로 초기화
  }
  
  const siteUrl = new URL("https://zippling.net");

  // 2. [수정됨] 번역 파일에서 title과 description을 가져옵니다.
  //    파일이 없거나 키가 없을 경우를 대비해 기본값을 설정합니다.
  const title = messages.Metadata?.title || "Zippling – Canada Room Rentals, Share Houses & Community";
  const description = messages.Metadata?.description || "Your community for room rentals, share houses, and homestays for students in Canada.";


  return {
    metadataBase: siteUrl,
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}`,
      languages: { "en-CA": "/en", "ko-KR": "/ko", "ja-JP": "/ja" },
    },
    openGraph: {
      title, description, url: siteUrl, siteName: "Zippling",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Zippling Logo" }],
      locale: locale === 'ko' ? 'ko_KR' : (locale === 'ja' ? 'ja_JP' : 'en_CA'),
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch (error) {
    // 이제 이 레이아웃은 언어 경로에만 적용되므로,
    // 번역 파일이 없으면 404 페이지를 보여주는 것이 올바른 동작입니다.
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* 1. 전체를 감싸는 div에 flexbox 설정을 적용합니다. */}
      <div className="flex flex-col min-h-screen">
        <HeaderWithTopbar locale={locale} />

        {/* 2. 메인 콘텐츠 영역이 남는 공간을 모두 차지하도록 만듭니다. */}
        <div className="flex-grow">{children}</div>

        {/* 3. 푸터는 자연스럽게 최하단으로 밀려납니다. */}
        <footer className="bg-white text-gray-500 text-center py-4 text-sm">
          © 2025 Zippling Inc. All rights reserved.
        </footer>
      <Script
        strategy="afterInteractive"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
      />
      </div>
    </NextIntlClientProvider>
  );
}
