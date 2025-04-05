'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function VancouverSearchPage() {
  const t = useTranslations();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || ''; // 예) /en/vancouver/search?q=someKeyword

  return (
    <main>
      <h1>{t('vancouverSearchTitle')}</h1>
      <p>{t('vancouverSearchDescription')}</p>

      <form action={`/${locale}/vancouver/search`} method="GET">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search..."
        />
        <button type="submit">Search</button>
      </form>

      <p>검색어: {query}</p>
      {/* 여기에 query를 이용한 실제 검색 결과 표시 로직 추가 */}
    </main>
  );
}
