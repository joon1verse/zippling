// app/[locale]/layout.tsx

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import Script from "next/script";
import HeaderWithTopbar from "./header_with_topbar";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  let messages;
  try {
    messages = (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch (error) {
    messages = {}; 
  }
  
  const siteUrl = new URL("https://zippling.net");

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
    notFound();
  }

  // [FIXED] Root layout(app/layout.tsx)에서 <html>과 <body>를 이미 정의했으므로,
  // 여기서는 해당 태그들을 제거하고 실제 컨텐츠만 반환합니다.
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col min-h-screen">
        <HeaderWithTopbar locale={locale} />
        <main className="flex-grow">{children}</main>
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
