// app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'
import SupabaseProvider from '@server/supabaseProvider'
import Script from 'next/script' // next/script 임포트

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* 애드센스 코드는 <head> 태그 내부에 위치해야 합니다.
        Next.js App Router에서는 next/script 컴포넌트를 사용하여 스크립트가 올바른 위치에 삽입되도록 합니다.
        strategy="afterInteractive"는 페이지가 상호작용 가능해진 후에 스크립트를 로드합니다.
        YOUR_PUBLISHER_ID 부분을 실제 애드센스 퍼블리셔 ID로 교체해야 합니다.
      */}
      <Script async 
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3494006453865250"
      crossOrigin="anonymous">
      strategy="afterInteractive"
      </Script>

      <body>
        {/* 전역에서 단 한 번만 Supabase Client를 생성해 감싸 줍니다 */}
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
