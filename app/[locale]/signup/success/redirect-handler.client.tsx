/*
================================================================================
  1. 클라이언트 컴포넌트 (신규 생성)
  파일 경로: app/[locale]/signup/success/redirect-handler.client.tsx
  (이 파일을 새로 생성해주세요.)
================================================================================
*/
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectHandler({ locale }: { locale: string }) {
  const router = useRouter();

  // 3초 후에 홈페이지로 자동 이동시키는 클라이언트 사이드 로직
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/${locale}`);
    }, 3000);
    
    // 컴포넌트가 언마운트될 때 타이머를 정리합니다.
    return () => clearTimeout(timer);
  }, [router, locale]);

  // 이 컴포넌트는 시각적인 UI를 렌더링하지 않습니다.
  return null;
}
