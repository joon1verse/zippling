// app/[locale]/page.tsx

import { getTranslations } from 'next-intl/server';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import HeroButtons from './HeroButtons'; 

export default async function HomePage() {
  // [수정] 'main' 대신 'MainPage' 네임스페이스를 사용합니다.
  const t = await getTranslations('MainPage');

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
        {/* [수정] 키 이름 변경 */}
        <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl mt-4 mb-4 break-keep">
            {t('heroSlogan')}
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed break-keep">
          {t('heroDescription')}
        </p>
      </section>

      {/* 🏙️ 2단 그리드 레이아웃의 히어로 섹션 */}
      <section className="py-7 sm:py-13 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* 1. 왼쪽: 텍스트 콘텐츠 영역 (밴쿠버 의존성 제거) */}
            <div className="text-center lg:text-left order-last lg:order-first">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-4 text-base font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                <Sparkles className="w-5 h-5 text-teal-500" />
                {/* [수정] 일반 프로모션 키로 변경 */}
                <span>{t('promoTagline')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5 break-keep">
                {t('promoTitle')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed break-keep">
                {t('promoDescription')}
              </p>
              {/* HeroButtons는 도시 선택 로직을 담을 수 있으므로 유지하거나 수정할 수 있습니다. */}
              <HeroButtons /> 
            </div>

            {/* 2. 오른쪽: 이미지 카드 (기존과 동일) */}
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