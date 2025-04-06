'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useParams();

  const handleCityClick = (city: string, disabled: boolean) => {
    if (!disabled) {
      router.push(`/${locale}/${city}/room`);
    }
  };

  return (
    <>
      {/* 💬 메인 슬로건 */}
      <section className="w-full flex flex-col items-center px-4 pt-4 pb-8">
        <div className="text-center mb-0 px-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            {t('hello')}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-none mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* 🏙️ 도시 선택 영역 */}
      <section className="w-full mb-2 px-4 py-8 bg-white text-center">
        {/* 안내 문구 */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 underline underline-offset-4 decoration-teal-500">
          {t('chooseCity')}
        </h2>

        {/* 도시 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
          {/* Vancouver */}
          <div
            onClick={() => handleCityClick('vancouver', false)}
            className="cursor-pointer group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48 sm:h-64">
              <img
                src="/images/vancouver_main.jpg"
                alt="Vancouver"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded">
                <span className="text-white text-lg font-semibold drop-shadow-sm">
                  Vancouver
                </span>
              </div>
            </div>
          </div>

          {/* Toronto (비활성) */}
          <div className="relative h-48 sm:h-64 opacity-50 cursor-not-allowed rounded-xl overflow-hidden shadow-inner">
            <img
              src="/images/toronto_main.jpg"
              alt="Toronto (Coming Soon)"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="text-white text-lg font-medium">
                Toronto (Coming Soon)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 🔽 구분선 겸 배경 전환 (시각 구분용) */}
      <div className="w-full h-8 bg-gradient-to-b from-transparent to-gray-100" />

      {/* 📖 소개 섹션 */}
      <section className="text-center px-4 py-20 bg-gray-50">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          {t('whyZipplingTitle')}
        </h2>

        <p className="text-gray-700 max-w-4xl mx-auto whitespace-pre-line leading-relaxed">
          {t('whyZipplingDescription')}
        </p>
      </section>
    </>
  );
}
