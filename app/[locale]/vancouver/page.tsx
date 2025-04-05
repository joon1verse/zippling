'use client';

import { useTranslations } from 'next-intl';

export default function VancouverPage() {
  const t = useTranslations();

  return (
    <section className="flex flex-col items-center mt-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {t('vancouver')} Page
        </h2>
        <p className="text-gray-600">
          This is a dedicated page for Vancouver content.
        </p>
      </div>
    </section>
  );
}
