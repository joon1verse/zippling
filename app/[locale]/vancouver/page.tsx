'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Home, Briefcase, MessageSquare, Flame } from 'lucide-react';

export default function VancouverHubPage() {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useParams() as { locale: string };

  const navigate = (slug: string) => {
    router.push(`/${locale}/vancouver/${slug}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      {/* 페이지 제목 */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
        {t('main_van_what_do')}
      </h2>

      {/* 3cols × 2rows 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-2 gap-4">

        {/* 1) Room — 상단 전체 3col × 1row */}
        <div
          onClick={() => navigate('room')}
          className="
            cursor-pointer
            md:col-span-3 md:row-start-1
            flex flex-col justify-center items-center
            rounded-2xl shadow-lg hover:shadow-xl
            bg-gradient-to-br from-teal-400 to-blue-500
            hover:from-teal-500 hover:to-blue-600
            transition-all duration-200
            p-4 md:p-6
            min-h-[160px] md:min-h-[200px]
          "
        >
          <Home className="w-10 h-10 md:w-14 md:h-14 mb-2 text-white drop-shadow" />
          <span className="text-lg md:text-xl font-bold mb-1 text-white drop-shadow">
            {t('main_van_room')}
          </span>
          <span className="text-white/90 text-sm md:text-base text-center">
            {t('main_van_room_desc')}
          </span>
        </div>

        {/* 2) Hot Deal — 하단 왼쪽 1col × 1row */}
        <div
          onClick={() => router.push(`/${locale}/hot-deal`)}
          className="
            cursor-pointer
            md:col-start-1 md:row-start-2
            p-1 rounded-2xl
            bg-gradient-to-br from-orange-500 to-orange-600
            hover:from-orange-600 hover:to-orange-700
            hover:shadow-lg
            transition-all duration-200
            min-h-[160px] md:min-h-[200px]
          "
        >
          <div className="
            relative h-full flex flex-col justify-center items-center
            bg-white rounded-xl p-4 md:p-6
          ">
            <Flame className="w-6 h-6 md:w-8 md:h-8 mb-2 text-orange-600" />
            <span className="text-base md:text-lg font-semibold text-orange-600 mb-1">
              {t('main_van_hot_deal')}
            </span>
            <span className="text-xs md:text-sm text-gray-600 text-center">
              {t('main_van_hot_deal_desc')}
            </span>
          </div>
        </div>

        {/* 3) Find a Job — 하단 중간 1col × 1row */}
        <div
          onClick={() => navigate('find-job')}
          className="
            cursor-pointer
            md:col-start-2 md:row-start-2
            flex flex-col justify-center items-center
            rounded-xl shadow-md hover:shadow-lg
            bg-white hover:bg-blue-50
            transition-all duration-200
            p-3 md:p-4
            min-h-[120px] md:min-h-[150px]
            border border-blue-100
          "
        >
          <Briefcase className="w-5 h-5 md:w-6 md:h-6 mb-1 text-blue-500" />
          <span className="text-sm md:text-base font-semibold mb-1 text-blue-700">
            {t('main_van_find_job')}
          </span>
          <span className="text-xs md:text-sm text-gray-600 text-center">
            {t('main_van_find_job_desc')}
          </span>
        </div>

        {/* 4) Community — 하단 오른쪽 1col × 1row */}
        <div
          onClick={() => navigate('community')}
          className="
            cursor-pointer
            md:col-start-3 md:row-start-2
            flex flex-col justify-center items-center
            rounded-xl shadow-md hover:shadow-lg
            bg-white hover:bg-gray-100
            transition-all duration-200
            p-3 md:p-4
            min-h-[120px] md:min-h-[150px]
            border border-gray-200
          "
        >
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 mb-1 text-gray-500" />
          <span className="text-sm md:text-base font-semibold mb-1 text-gray-800">
            {t('main_van_community')}
          </span>
          <span className="text-xs md:text-sm text-gray-600 text-center">
            {t('main_van_community_desc')}
          </span>
        </div>

      </div>
    </div>
  );
}
