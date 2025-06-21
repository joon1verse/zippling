'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Home, Briefcase, User, ShoppingBag } from 'lucide-react';

export default function VancouverHubPage() {
  const t = useTranslations();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* 상단 안내문구 */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-10 text-center">
        {t('main_van_what_do')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Room 카드 */}
        <Link
          href="room"
          className={`
            md:row-span-2 min-h-[320px] flex flex-col justify-center items-center rounded-3xl
            shadow-xl bg-gradient-to-br from-teal-400 to-blue-500
            hover:from-teal-500 hover:to-blue-600
            transition-all duration-200
            p-10 md:col-span-1
            transform hover:scale-105
          `}
        >
          <Home className="w-16 h-16 mb-4 text-white drop-shadow" />
          <span className="text-2xl font-bold mb-2 text-white drop-shadow">{t('main_van_room')}</span>
          <span className="text-white/90 text-lg text-center">{t('main_van_room_desc')}</span>
        </Link>

        {/* 오른쪽 카드 그룹 */}
        <div className="flex flex-col gap-8 md:col-span-2">
          <div className="flex flex-col md:flex-row gap-8">
            <Link
              href="jobs"
              className={`
                flex-1 min-h-[130px] flex flex-col justify-center items-center rounded-2xl
                shadow-md bg-white hover:bg-blue-50
                transition-all duration-200
                p-8 border border-blue-100
                hover:shadow-lg transform hover:-translate-y-1
              `}
            >
              <Briefcase className="w-10 h-10 mb-2 text-blue-500" />
              <span className="text-lg font-semibold mb-1 text-blue-700">{t('main_van_find_job')}</span>
              <span className="text-gray-600 text-center text-base">{t('main_van_find_job_desc')}</span>
            </Link>
            <Link
              href="resumes"
              className={`
                flex-1 min-h-[130px] flex flex-col justify-center items-center rounded-2xl
                shadow-md bg-white hover:bg-green-50
                transition-all duration-200
                p-8 border border-green-100
                hover:shadow-lg transform hover:-translate-y-1
              `}
            >
              <User className="w-10 h-10 mb-2 text-green-500" />
              <span className="text-lg font-semibold mb-1 text-green-700">{t('main_van_post_resume')}</span>
              <span className="text-gray-600 text-center text-base">{t('main_van_post_resume_desc')}</span>
            </Link>
          </div>
          {/* Flea Market */}
          <Link
            href="flea"
            className={`
              min-h-[130px] flex flex-col justify-center items-center rounded-2xl
              shadow-md bg-white hover:bg-yellow-50
              transition-all duration-200
              p-8 border border-yellow-100
              hover:shadow-lg transform hover:-translate-y-1
            `}
          >
            <ShoppingBag className="w-10 h-10 mb-2 text-yellow-500" />
            <span className="text-lg font-semibold mb-1 text-yellow-700">{t('main_van_flea_market')}</span>
            <span className="text-gray-600 text-center text-base">{t('main_van_flea_market_desc')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
