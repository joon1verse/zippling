// app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'
import SupabaseProvider from '@server/supabaseProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* 전역에서 단 한 번만 Supabase Client를 생성해 감싸 줍니다 */}
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
