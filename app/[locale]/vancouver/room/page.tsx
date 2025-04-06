'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Globe, Mars, Venus, Info } from 'lucide-react';

const PAGE_SIZE = 20;

export default function VancouverRoomPage() {
  const t = useTranslations();
  const [listings, setListings] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data/vancouver_crawldata.json')
      .then((res) => res.json())
      .then((data) => setListings(data));
  }, []);

  const toggleFilter = (tag: string, type: 'region' | 'gender') => {
    if (type === 'region') {
      setSelectedRegions((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    } else {
      setSelectedGenders((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion =
        selectedRegions.length === 0 || selectedRegions.some((tag) => post.tag.includes(tag));
      const matchesGender =
        selectedGenders.length === 0 || selectedGenders.some((tag) => post.tag.includes(tag));
      return matchesSearch && matchesRegion && matchesGender;
    });
  }, [listings, searchQuery, selectedRegions, selectedGenders]);

  const paginated = filteredListings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE);

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
    <main className="px-4 py-8 max-w-4xl mx-auto">
      {/* ✅ 공지문 */}
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-1 text-yellow-700 shrink-0" />
          <p className="text-sm whitespace-pre-line leading-relaxed">
            {t('roompage_disclaimer')}
          </p>
        </div>
      </div>


      <h1 className="text-xl font-bold mb-4">🏠 {t('roomListTitle')}</h1>

      {/* ✅ 검색창 + 필터 2열 그리드 UI */}
      <section className="bg-white border p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 🔍 검색창 */}
          <input
            type="text"
            placeholder={t('roompage_searchbar')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* 🧰 필터 영역 (레이블 제거 + 구분만) */}
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            {/* 🌍 Region 그룹 */}
            <div className="flex flex-wrap gap-2">
              {['korea', 'canada', 'japan'].map((region) => {
                const selected = selectedRegions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleFilter(region, 'region')}
                    className={`px-3 py-1 rounded-full border transition text-sm
                      ${selected ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-700 border-gray-300'}
                      hover:border-teal-500 hover:text-teal-600`}
                  >
                    {t(`site.${region}`)}
                  </button>
                );
              })}
            </div>

            {/* 🚻 Gender 그룹 */}
            <div className="flex flex-wrap gap-2">
              {['male', 'female'].map((gender) => {
                const selected = selectedGenders.includes(gender);
                return (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => toggleFilter(gender, 'gender')}
                    className={`px-3 py-1 rounded-full border transition text-sm
                      ${selected ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}
                      hover:border-blue-500 hover:text-blue-600`}
                  >
                    {t(gender)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* ✅ 게시글 목록 */}
      <ul className="space-y-6">
        {paginated.map((post, idx) => (
          <li key={idx} className="p-4 border rounded shadow hover:shadow-md transition min-w-full">
            <div className="flex justify-between items-start mb-1">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-semibold underline text-sm"
              >
                {post.title}
              </a>
              <span className="text-sm text-gray-500">
                {post.crawledAt || post.postedAt
                  ? formatDistanceToNow(
                      new Date(post.crawledAt ?? post.postedAt),
                      { addSuffix: true }
                    )
                  : 'Unknown time'}
              </span>
            </div>

            <div className="flex justify-between items-end mt-2 text-sm text-gray-700">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-1 text-green-700 font-medium">
                  <Globe className="w-4 h-4" />
                  <span>{renderSourceTag(post.tag)}</span>
                </div>
                {renderGender(post.tag)}
              </div>
              {post.source && (
                <div className="flex items-center justify-end gap-1 text-xs text-gray-700 font-medium italic">
                  <Info className="w-4 h-4 text-gray-600" />
                  <span>{post.source}</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* ✅ 페이지네이션 */}
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