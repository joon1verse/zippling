// app/[locale]/page.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations(); // 'common.json'을 불러온 후, Key를 통해 번역 호출
  return (
    <main>
      <h1>{t('hello')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}
