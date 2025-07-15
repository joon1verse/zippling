// app/[locale]/page.tsx

import { getTranslations } from 'next-intl/server';
import CommunitySection from './page-community'; 
import HeroSection from './page-herosection';
// [수정] WaveSeparator import를 제거합니다.

export default async function HomePage() {
  const t = await getTranslations('MainPage');

  const heroTranslations = {
    heroSlogan: t('heroSlogan'),
    heroDescription: t('heroDescription'),
    promoTagline: t('promoTagline'),
    promoTitle: t('promoTitle'),
    promoDescription: t('promoDescription'),
  };

  const whyZipplingTranslations = {
    title: t('whyZipplingTitle'),
    description: t('whyZipplingDescription'),
  }

  return (
    <main className="bg-white">
      <HeroSection t={heroTranslations} />

      {/* [수정] WaveSeparator를 여기서 렌더링하지 않습니다. */}
      
      <CommunitySection />

      <section className="text-center px-4 py-14 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            {whyZipplingTranslations.title}
          </h2>
          <p className="text-gray-700 text-lg whitespace-pre-line leading-relaxed">
            {whyZipplingTranslations.description}
          </p>
        </div>
      </section>
    </main>
  );
}