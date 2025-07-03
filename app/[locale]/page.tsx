// app/[locale]/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const t = useTranslations('main');
  const router = useRouter();
  const { locale } = useParams() as { locale: string };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <main className="bg-gray-50">
      {/* ✨ ZIPPLING 브랜딩 및 메인 슬로건 섹션 */}
      <section className="text-center px-4 pt-10 pb-8 bg-gradient-to-b from-white to-gray-50">
        <h1 
          className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent"
          style={{ textShadow: '0 2px 10px rgba(45, 212, 191, 0.2)' }}
        >
          ZIPPLING
        </h1>
        <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl mt-4 mb-4 break-keep">
            {t('hello')}
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed break-keep">
          {t('description')}
        </p>
      </section>

      {/* 🏙️ 2단 그리드 레이아웃의 히어로 섹션 */}
      <section className="py-7 sm:py-13 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* 1. 왼쪽: 텍스트 콘텐츠 영역 */}
            <div className="text-center lg:text-left order-last lg:order-first">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-4 text-base font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <span>{t('vancouver.tagline')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5 break-keep">
                {t('vancouver.title')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed break-keep">
                {t('vancouver.description')}
              </p>
              {/* 버튼 그룹 */}
              <div className="mt-10 flex flex-col items-center lg:items-start gap-5">
                <button
                  onClick={() => handleNavigate(`/${locale}/vancouver`)}
                  className="
                    inline-flex items-center justify-center gap-3
                    px-8 py-4
                    bg-teal-600 text-white text-base font-bold
                    rounded-full shadow-lg
                    hover:bg-teal-500
                    transition-all duration-300
                    transform hover:scale-105
                    hover:shadow-2xl hover:shadow-teal-400/50
                  "
                >
                  <span>{t('vancouver.buttonText')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                {/* "밴쿠버가 처음이신가요?" 링크 버튼 */}
                <button
                  onClick={() => handleNavigate(`/${locale}/guides/vancouver-first-timers`)}
                  className="
                    group inline-flex items-center gap-1.5
                    text-sm font-semibold text-gray-600
                    hover:text-gray-900
                    transition-colors duration-200
                  "
                >
                  <span>{t('vancouver.firstTimerLinkText')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* 2. 오른쪽: 이미지 카드 */}
            <div className="relative w-full h-80 sm:h-96 lg:h-full min-h-[320px] order-first lg:order-last">
                <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl shadow-gray-300/40"></div>
                <div className="absolute inset-4 overflow-hidden rounded-xl shadow-lg">
                    <Image
                        src="/images/vancouver_main.jpg"
                        alt="Vancouver Cityscape"
                        fill
                        priority
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📖 소개 섹션 */}
      <section className="text-center px-4 py-14 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            {t('whyZipplingTitle')}
          </h2>
          <p className="text-gray-700 text-lg whitespace-pre-line leading-relaxed">
            {t('whyZipplingDescription')}
          </p>
        </div>
      </section>
    </main>
  );
}
