'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { Globe, Mars, Venus, AlertTriangle } from 'lucide-react';


const PAGE_SIZE = 20;

export default function VancouverRoomPage() {
  const t = useTranslations();
  const [listings, setListings] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/data/vancouver_crawldata.json')
      .then(res => res.json())
      .then(data => setListings(data));
  }, []);

  const paginated = listings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(listings.length / PAGE_SIZE);

  const renderGender = (tags: string[]) => {
    if (tags.includes('female')) {
      return (
        <div className="flex items-center gap-1 text-pink-500 font-medium">
          <Venus className="w-4 h-4" />
          <span>{t('female')}</span>
        </div>
      );
    }
    if (tags.includes('male')) {
      return (
        <div className="flex items-center gap-1 text-blue-500 font-medium">
          <Mars className="w-4 h-4" />
          <span>{t('male')}</span>
        </div>
      );
    }
    return null;
  };

  const renderSourceTag = (tags: string[]) => {
    if (tags.includes('korea')) return t('site.korea');
    if (tags.includes('canada')) return t('site.canada');
    if (tags.includes('japan')) return t('site.japan');
    return '';
  };

  return (
    <main className="px-4 py-8 w-full max-w-3xl mx-auto">
        {/* 🚨 경고 문구 */}
        <p className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 p-4 rounded-md leading-relaxed">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
            <span>{t('roompage_disclaimer')}</span>
        </p>

      {/* ✅ 글씨 크기 조정 (text-2xl → text-xl) */}
      <h1 className="text-2xl font-bold mb-6">🏠 {t('roomListTitle')}</h1>

      <ul className="space-y-6">
        {paginated.map((post, idx) => (
          <li
          key={idx}
          className="w-full p-4 border rounded shadow hover:shadow-md transition flex flex-col gap-2"
        >
          {/* 상단: 타이틀 + 시간 */}
          <div className="flex justify-between items-start">
            <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-semibold underline text-sm"
            >
                {post.title}
            </a>

            <span className="text-sm text-gray-500 pl-2 whitespace-nowrap pt-0.5">
                {formatDistanceToNow(new Date(post.crawledAt), {
                addSuffix: true,
                }).replace(/^about /, '')}
            </span>
          </div>
                    
          {/* 태그: 출처 + 성별 */}
          <div className="mt-2 flex justify-between items-center text-sm text-gray-700">
            {/* 좌측: 국가 + 성별 */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* 국가 */}
                <div className="flex items-center gap-1 text-green-700 font-medium">
                    <Globe className="w-4 h-4" />
                    <span>{renderSourceTag(post.tag)}</span>
                </div>

                {/* 성별 */}
                {renderGender(post.tag)}
            </div>

            {/* 우측: 출처 */}
            {post.source && (
                <div className="text-sm text-gray-500 italic text-right">
                {post.source}
                </div>
            )}
            </div>
        </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-10">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </main>
  );
}
