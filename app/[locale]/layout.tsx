// app/[locale]/layout.tsx
import "../globals.css";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Nunito } from "next/font/google";

// 변경: Header 대신 HeaderWithTopbar를 import
import HeaderWithTopbar from "./header_with_topbar";
import SupabaseProvider from "@server/supabaseProvider";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ko" }, { locale: "ja" }];
}

const nunito = Nunito({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

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
  } catch {
    notFound();
  }

  return (
    <html lang={locale} className={nunito.className}>
      <body className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SupabaseProvider>
            {/* 변경: 기존 <Header>를 <HeaderWithTopbar>로 교체 */}
            <HeaderWithTopbar locale={locale} />

            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
              {children}
            </main>
          </SupabaseProvider>

          <footer className="bg-white text-gray-500 text-center py-4 text-sm">
            © 2025 Zippling Inc. All rights reserved.
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
