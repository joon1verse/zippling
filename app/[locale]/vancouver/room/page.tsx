'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Globe, Mars, Venus, Info } from 'lucide-react';
import type { Database } from '@server/types';

type RoomPost = Database['public']['Tables']['vancouver_roomlistings']['Row'];

const PAGE_SIZE = 20;
const BLOCK_SIZE = 5;

export default function VancouverRoomPage() {
  const t = useTranslations();
  const [listings, setListings] = useState<RoomPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('vancouver_roomlistings')
        .select('*')
        .order('event_time', { ascending: false })
        .limit(1000);

      if (error) {
        console.error(error.message);
        return;
      }

      const normalized = (data ?? []).map((row) => ({
        ...row,
        tag: Array.isArray(row.tag)
          ? row.tag
          : typeof row.tag === 'string'
            ? row.tag.replace(/[{}"]/g, '').split(',').map((v) => v.trim()).filter(Boolean)
            : []
      })) as (RoomPost & { tag: string[] })[];

      setListings(normalized);
    })();
  }, []);

  const toggleFilter = (tag: string, type: 'region' | 'gender') => {
    const setter = type === 'region' ? setSelectedRegions : setSelectedGenders;
    setter((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    setCurrentPage(1);
  };

  const filteredListings = useMemo(() => {
    return listings.filter((p) => {
      const search = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const region =
        selectedRegions.length === 0 || selectedRegions.some((t) => p.tag.includes(t));
      const gender =
        selectedGenders.length === 0 || selectedGenders.some((t) => p.tag.includes(t));
      return search && region && gender;
    });
  }, [listings, searchQuery, selectedRegions, selectedGenders]);

  const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE);
  const paginated = filteredListings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const currentBlock = Math.floor((currentPage - 1) / BLOCK_SIZE);
  const blockStart = currentBlock * BLOCK_SIZE + 1;
  const blockEnd = Math.min(blockStart + BLOCK_SIZE - 1, totalPages);

  const renderTime = (p: RoomPost) =>
    p.event_time
      ? formatDistanceToNow(new Date(p.event_time), { addSuffix: true })
      : '';

  const renderGender = (tags: string[]) => {
    if (tags.includes('female'))
      return (
        <span className="flex items-center gap-1 text-pink-500 font-medium">
          <Venus className="w-3 h-3" />
          {t('female')}
        </span>
      );
    if (tags.includes('male'))
      return (
        <span className="flex items-center gap-1 text-blue-500 font-medium">
          <Mars className="w-3 h-3" />
          {t('male')}
        </span>
      );
    return null;
  };

  const renderSourceTag = (tags: string[]) => {
    if (tags.includes('korea')) return t('site.korea');
    if (tags.includes('canada')) return t('site.canada');
    if (tags.includes('japan')) return t('site.japan');
    return '';
  };

  return (
    <main className="w-full max-w-screen-lg mx-auto px-2 py-6">
      {/* 공지 */}
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {t('roompage_disclaimer')}
          </p>
        </div>
      </div>

      <header className="mb-4 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">🏠 {t('roomListTitle')}</h1>
      </header>

      {/* 검색 + 필터 */}
      <section className="bg-white border p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={t('roompage_searchbar')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-teal-500"
          />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {['korea', 'canada', 'japan'].map((r) => {
                const sel = selectedRegions.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => toggleFilter(r, 'region')}
                    className={`px-3 py-1 rounded-full border transition
                      ${sel
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-white text-gray-700 border-gray-300'}
                      hover:border-teal-500 hover:text-teal-600`}
                  >
                    {t(`site.${r}`)}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {['male', 'female'].map((g) => {
                const sel = selectedGenders.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleFilter(g, 'gender')}
                    className={`px-3 py-1 rounded-full border transition
                      ${sel
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300'}
                      hover:border-blue-500 hover:text-blue-600`}
                  >
                    {t(g)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 리스트 (게시판 row 스타일, 여백 최소화) */}
      <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
  {paginated.map((post) => (
    <li key={post.id} className="px-3 py-2 hover:bg-gray-50 transition group">
      {/* 1. 제목-출처 flex-row 한 줄! */}
      <div className="flex flex-row items-center w-full">
        <a
          href={post.link ?? '#'}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-base group-hover:underline text-blue-700 truncate flex-1 min-w-0"
        >
          {post.title}
        </a>
        {post.source && (
          <span className="flex items-center gap-1 text-xs italic text-gray-500 flex-shrink-0 ml-3">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            {post.source}
          </span>
        )}
      </div>
      {/* 2. 가격, 시간, 태그 */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-0.5">
        {post.price && <span className="text-gray-600">{`￦${post.price}`}</span>}
        <span>{renderTime(post)}</span>
        <span>· {renderSourceTag(post.tag)}</span>
        <span className="flex gap-1 items-center">{renderGender(post.tag)}</span>
      </div>
    </li>
  ))}
</ul>



      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10 items-center">
          {currentBlock > 0 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700"
              >
                ≪
              </button>
              <button
                onClick={() => setCurrentPage(blockStart - 1)}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700"
              >
                &lt;
              </button>
            </>
          )}
          {Array.from({ length: blockEnd - blockStart + 1 }).map((_, i) => {
            const n = blockStart + i;
            return (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`px-3 py-1 rounded ${currentPage === n
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {n}
              </button>
            );
          })}
          {blockEnd < totalPages && (
            <>
              <button
                onClick={() => setCurrentPage(blockEnd + 1)}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700"
              >
                &gt;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700"
              >
                ≫
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
