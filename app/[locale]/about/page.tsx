/*
================================================================================
  2. 기존 서버 컴포넌트 수정
  파일 경로: app/[locale]/about/page.tsx
  (이 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import HeroSection from './hero-section.client'; // 방금 생성한 클라이언트 컴포넌트를 import 합니다.

// SEO 메타데이터 생성 (서버에서 실행)
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'AboutPage.meta' });
  return {
    title: t('title'),
  };
}

// 페이지 컴포넌트 (서버 컴포넌트)
export default async function AboutUsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('AboutPage');

  const heroImageKeys = [
    "hero.imageAlt1", "hero.imageAlt2", "hero.imageAlt3", "hero.imageAlt4",
    "hero.imageAlt5", "hero.imageAlt6", "hero.imageAlt7", "hero.imageAlt8"
  ];

  // 클라이언트 컴포넌트에 전달할 이미지 데이터 배열을 서버에서 미리 생성합니다.
  const heroImages = heroImageKeys.map((altKey, index) => ({
    src: `/images/about_hero_${index + 1}.jpg`,
    alt: t(altKey), // 번역된 텍스트를 직접 전달
  }));

  return (
    <>
      {/* HeroSection 클라이언트 컴포넌트를 렌더링하고, 번역된 텍스트를 props로 전달합니다. */}
      <HeroSection
        headline={t('hero.headline')}
        subheadline={t('hero.subheadline')}
        images={heroImages}
      />

      {/* 메인 콘텐츠 (서버 컴포넌트로 유지) */}
      <main>
        {/* 우리의 이야기 섹션 */}
        <section className="w-full py-10 px-4 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
                {t('story.title')}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4 break-keep">
                {t('story.paragraph1')}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4 break-keep">
                {t('story.paragraph2')}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed break-keep">
                {t('story.paragraph3')}
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <Image
                src="/images/about_story_hero.jpg"
                alt={t('story.imageAlt')}
                width={600}
                height={400}
                className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* 미션과 비전 섹션 */}
        <section className="w-full py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="p-8 bg-white rounded-xl shadow-md">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-teal-500 text-4xl mr-3">🎯</span>
                {t('mission.title')}
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t('mission.paragraph')}
              </p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-purple-500 text-4xl mr-3">✨</span>
                {t('vision.title')}
              </h3>
              <ul className="space-y-3 text-lg text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-2 mt-1">✓</span> {t('vision.point1')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-2 mt-1">✓</span> {t('vision.point2')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-xl mr-2 mt-1">✓</span> {t('vision.point3')}
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 핵심 가치 섹션 */}
        <section className="w-full py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10">
              {t('values.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-5xl mb-4 text-teal-500">{t('values.value1.icon')}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{t('values.value1.title')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('values.value1.description')}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-5xl mb-4 text-purple-500">{t('values.value2.icon')}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{t('values.value2.title')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('values.value2.description')}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-5xl mb-4 text-blue-500">{t('values.value3.icon')}</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{t('values.value3.title')}</h4>
                <p className="text-gray-600 leading-relaxed">{t('values.value3.description')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 행동 유도(CTA) 섹션 */}
      <section className="w-full py-16 px-4 bg-teal-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t('cta.headline')}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t('cta.subheadline')}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
          >
            {t('cta.buttonText')}
          </Link>
        </div>
      </section>
    </>
  );
}