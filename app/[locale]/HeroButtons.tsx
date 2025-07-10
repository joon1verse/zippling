'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation'; // next/navigation에서 가져옵니다.
import { ArrowRight } from 'lucide-react';

export default function HeroButtons() {
  const t = useTranslations('MainPage'); // 네임스페이스를 더 구체적으로 지정
  const router = useRouter();
  
  // locale 정보는 router가 자동으로 처리하므로 useParams는 필요 없습니다.

  return (
    <div className="mt-10 flex flex-col items-center lg:items-start gap-5">
      <button
        onClick={() => router.push('/vancouver')} // locale이 자동으로 포함됩니다.
        className="
          inline-flex items-center justify-center gap-3
          px-8 py-4 bg-teal-600 text-white text-base font-bold
          rounded-full shadow-lg hover:bg-teal-500
          transition-all duration-300 transform hover:scale-105
          hover:shadow-2xl hover:shadow-teal-400/50
        "
      >
        <span>{t('promoButtonText')}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => router.push('/vancouver/guides')}
        className="
          group inline-flex items-center gap-1.5
          text-sm font-semibold text-gray-600
          hover:text-gray-900 transition-colors duration-200
        "
      >
        <span>{t('readGuideLinkText')}</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </div>
  );
}