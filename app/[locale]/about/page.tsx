// app/[locale]/about/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams } from 'next/navigation'; // useParams 임포트 추가

export default function AboutUsPage() {
  const t = useTranslations('about');
  const { locale } = useParams() as { locale: string }; // 현재 로케일 가져오기

  // 이미지 배열 (반복을 위해 사용)
  const heroImages = [
    // 이미지 크기를 150x200으로 통일하고, 확장자를 .jpg로 변경했습니다.
    { src: "/images/about_hero_1.jpg", altKey: "hero.imageAlt1", width: 150, height: 200 }, 
    { src: "/images/about_hero_2.jpg", altKey: "hero.imageAlt2", width: 150, height: 200 },
    { src: "/images/about_hero_3.jpg", altKey: "hero.imageAlt3", width: 150, height: 200 },
    { src: "/images/about_hero_4.jpg", altKey: "hero.imageAlt4", width: 150, height: 200,},
    { src: "/images/about_hero_5.jpg", altKey: "hero.imageAlt5", width: 150, height: 200 },
    // 새로 추가할 이미지들
    { src: "/images/about_hero_6.jpg", altKey: "hero.imageAlt6", width: 150, height: 200 },
    { src: "/images/about_hero_7.jpg", altKey: "hero.imageAlt7", width: 150, height: 200 },
    { src: "/images/about_hero_8.jpg", altKey: "hero.imageAlt8", width: 150, height: 200 },
  ];

  return (
    <>
      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%); /* 이미지 세트가 두 번 복제되었으므로 50% 이동 */
          }
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite; /* 40초 동안 선형 무한 반복 */
        }
      `}</style>

      {/* 🚀 히어로 섹션: 페이지의 첫인상 (메인 콘텐츠와는 별개의 도입부) */}
      <section className="relative w-full py-12 sm:py-10 md:py-14 lg:py-18 px-4 bg-gradient-to-br from-white to-gray-50 overflow-hidden flex flex-col items-center">
        <div className="text-center max-w-4xl mx-auto relative z-10 mb-10 sm:mb-12 md:mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            {t('hero.headline')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed px-4">
            {t('hero.subheadline')}
          </p>
        </div>
        <div className="w-full relative z-0 py-6 bg-black text-center"> 
            <div className="overflow-hidden">
                <div className="flex flex-nowrap animate-scroll-left w-max items-center">
                    {/* 첫 번째 이미지 세트 */}
                    {heroImages.map((img, index) => (
                        <div
                            key={`original-${index}`}
                            className={`relative shadow-xl rounded-lg overflow-hidden flex-shrink-0 mx-3 sm:mx-4 md:mx-5 lg:mx-5 xl:mx-5`}
                            style={{ minWidth: `${img.width}px`, height: `${img.height}px` }}
                        >
                            <Image
                                src={img.src}
                                alt={t(img.altKey) || `About Us Image ${index + 1}`}
                                width={img.width}
                                height={img.height}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ))}
                    {/* 두 번째 이미지 세트 (무한 반복을 위해 복제) */}
                    {heroImages.map((img, index) => (
                        <div
                            key={`duplicate-${index}`}
                            className={`relative shadow-xl rounded-lg overflow-hidden flex-shrink-0 mx-3 sm:mx-4 md:mx-5 lg:mx-5 xl:mx-5`}
                            style={{ minWidth: `${img.width}px`, height: `${img.height}px` }}
                        >
                            <Image
                                src={img.src}
                                alt={t(img.altKey) || `About Us Image ${index + 1}`}
                                width={img.width}
                                height={img.height}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* [수정됨] 페이지의 핵심 콘텐츠를 <main> 태그로 감쌉니다. */}
      <main>
        {/* 📖 우리의 이야기: Zippling의 탄생 배경 */}
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

        {/* 🎯 우리의 미션과 비전: Zippling의 방향성 */}
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

        {/* ⭐ Zippling의 핵심 가치: 우리가 일하는 방식 */}
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

      {/* 🌟 행동 유도 (Call to Action) 섹션 (메인 콘텐츠와는 별개의 마무리 영역) */}
      <section className="w-full py-16 px-4 bg-teal-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t('cta.headline')}
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            {t('cta.subheadline')}
          </p>
          <a
            href={`/${locale}`} // 로케일 기반 경로로 수정
            className="inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
          >
            {t('cta.buttonText')}
          </a>
        </div>
      </section>
    </>
  );
}
