// components/VisitTracker.tsx
'use client';

import { useEffect } from 'react';

export default function VisitTracker() {
  useEffect(() => {
    // 세션이 유지되는 동안 딱 한 번만 실행되도록 sessionStorage를 사용합니다.
    const hasTracked = sessionStorage.getItem('zippling_visit_tracked');

    if (!hasTracked) {
      fetch('/api/track-visit', { method: 'POST' });
      sessionStorage.setItem('zippling_visit_tracked', 'true');
    }
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
}