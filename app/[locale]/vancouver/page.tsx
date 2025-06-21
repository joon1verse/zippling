'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Home,
  Briefcase,
  User,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';

export default function VancouverHubPage() {
  const t = useTranslations();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-10 text-center">
        {t('main_van_what_do')}
      </h2>
      <div
        className="
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4
          grid-rows-5 md:grid-rows-2 gap-5 items-stretch
        "
      >
        {/* Room (2x2) */}
        <Link
          href="#"
          className="
            md:col-span-2 md:row-span-2
            flex flex-col justify-center items-center rounded-3xl shadow-xl
            bg-gradient-to-br from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600
            transition-all duration-200 min-h-[180px] md:min-h-[320px] lg:min-h-[420px] p-7 md:p-12
          "
        >
          <Home className="w-14 h-14 md:w-20 md:h-20 mb-3 text-white drop-shadow" />
          <span className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow">
            {t('main_van_room')}
          </span>
          <span className="text-white/90 text-base md:text-lg text-center">
            {t('main_van_room_desc')}
          </span>
        </Link>

        {/* Find a Job */}
        <Link
          href="#"
          className="
            md:col-start-3 md:row-start-1
            flex flex-col justify-center items-center rounded-2xl shadow-md bg-white hover:bg-blue-50
            transition-all duration-200 min-h-[110px] p-6 border border-blue-100 hover:shadow-lg
          "
        >
          <Briefcase className="w-8 h-8 mb-2 text-blue-500" />
          <span className="text-lg font-semibold mb-1 text-blue-700">
            {t('main_van_find_job')}
          </span>
          <span className="text-gray-600 text-center text-sm">
            {t('main_van_find_job_desc')}
          </span>
        </Link>

        {/* Post Resume */}
        <Link
          href="#"
          className="
            md:col-start-4 md:row-start-1
            flex flex-col justify-center items-center rounded-2xl shadow-md bg-white hover:bg-green-50
            transition-all duration-200 min-h-[110px] p-6 border border-green-100 hover:shadow-lg
          "
        >
          <User className="w-8 h-8 mb-2 text-green-500" />
          <span className="text-lg font-semibold mb-1 text-green-700">
            {t('main_van_post_resume')}
          </span>
          <span className="text-gray-600 text-center text-sm">
            {t('main_van_post_resume_desc')}
          </span>
        </Link>

        {/* Flea Market */}
        <Link
          href="#"
          className="
            md:col-start-3 md:row-start-2
            flex flex-col justify-center items-center rounded-2xl shadow-md bg-white hover:bg-yellow-50
            transition-all duration-200 min-h-[110px] p-6 border border-yellow-100 hover:shadow-lg
          "
        >
          <ShoppingBag className="w-8 h-8 mb-2 text-yellow-500" />
          <span className="text-lg font-semibold mb-1 text-yellow-700">
            {t('main_van_flea_market')}
          </span>
          <span className="text-gray-600 text-center text-sm">
            {t('main_van_flea_market_desc')}
          </span>
        </Link>

        {/* Community (Forum) */}
        <Link
          href="#"
          className="
            md:col-start-4 md:row-start-2
            flex flex-col justify-center items-center rounded-2xl shadow-md bg-white hover:bg-gray-100
            transition-all duration-200 min-h-[110px] p-6 border border-gray-200 hover:shadow-lg
          "
        >
          <MessageSquare className="w-8 h-8 mb-2 text-gray-500" />
          <span className="text-lg font-semibold mb-1 text-gray-800">
            {t('main_van_community')}
          </span>
          <span className="text-gray-600 text-center text-sm">
            {t('main_van_community_desc')}
          </span>
        </Link>
      </div>
    </div>
  );
}
