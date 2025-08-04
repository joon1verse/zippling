// app/layout.tsx

import "./globals.css";
import type { ReactNode } from "react";
import { Noto_Sans_KR } from "next/font/google";
import { getLocale, setRequestLocale } from "next-intl/server";
import VisitTracker from '@components/VisitTracker';

// 폰트 설정은 전역으로 유지합니다.
const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  style: "normal",
});

// 가장 기본적인 메타데이터만 정의합니다.
export const metadata = {
  title: "Zippling",
  description: "Canada’s Multilingual Community Platform for students.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    // <html>과 <body> 태그는 여기에만 존재합니다.
    <html lang={locale} className={notoSansKr.className}>
      {/* [수정됨] 사이트 전체 배경색을 여기서 지정합니다. */}
      <body className="bg-gray-50">
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
