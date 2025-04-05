'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useParams();
  const [city, setCity] = useState('');

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCity(selected);
    if (selected === 'vancouver') {
      router.push(`/${locale}/vancouver`);
    }
  };

  return (
    <>
      {/* 💬 메인 슬로건 & 드롭다운 */}
      <section className="w-full flex flex-col items-center px-4 py-12">
        <div className="text-center mb-10 px-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            {t('hello')}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="w-full max-w-1g">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            {t('chooseCity')}
          </label>
          <select
            id="city"
            value={city}
            onChange={handleCityChange}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm
                       focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
          >
            <option value="">{t('chooseCityPlaceholder')}</option>
            <option value="vancouver">{t('vancouver')}</option>
          </select>
        </div>
      </section>

      {/* 🌇 Hero 이미지 섹션 */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src="/images/vancouver_main.jpg"
          alt="Vancouver"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 아래쪽 투명한 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />

        {/* (선택) 이미지 위에 텍스트 넣고 싶으면 여기 추가 */}
      </section>

      {/* 아래쪽 텍스트 영역 */}
      <section className="text-center px-4 py-12 bg-gray-50">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        {t('whyZipplingTitle')}
      </h2>
      <p className="text-gray-700 text-base leading-relaxed max-w-none mx-auto whitespace-pre-line">
        {t('whyZipplingDescription')}
      </p>
      </section>
    </>
  );
}
