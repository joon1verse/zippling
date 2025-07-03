// vancouver/page.tsx
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react'; // Suspense 임포트
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Mars, Venus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Database } from '@server/types';
import { createBrowserClient } from '@supabase/ssr';
// useRouter와 useSearchParams를 가져옵니다.
import { useRouter, useSearchParams } from 'next/navigation';

type RoomPost = Database['public']['Tables']['vancouver_roomlistings']['Row'];

const POSTS_PER_PAGE = 20; // 페이지 당 게시물 수

// useSearchParams를 사용하는 실제 콘텐츠를 담을 내부 컴포넌트
// 이 컴포넌트가 VancouverRoomPage의 모든 기존 로직과 JSX를 포함합니다.
function VancouverRoomContent() {
  const t = useTranslations(); // 'common.json'에서 직접 키를 사용하므로 네임스페이스 지정 안 함
  const router = useRouter();
  const searchParams = useSearchParams(); // 이 훅이 Suspense로 감싸져야 할 주된 이유입니다.

  const [listings, setListings] = useState<RoomPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- 페이지네이션 상태 ---
  // URL에서 'page' 파라미터를 읽어와 현재 페이지를 설정합니다. 없으면 1로 초기화합니다.
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPosts, setTotalPosts] = useState(0);

  // --- 필터링 상태 ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 1. 데이터 불러오기 함수 (서버 기반 페이지네이션 및 필터링)
  const fetchListings = useCallback(async (page: number) => {
    setLoading(true);
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    let query = supabase
      .from('vancouver_roomlistings')
      .select('*', { count: 'exact' });

    // 필터링 로직
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }
    if (selectedRegions.length > 0) {
      query = query.contains('tag', selectedRegions);
    }
    if (selectedGenders.length > 0) {
      query = query.contains('tag', selectedGenders);
    }

    const { data, error, count } = await query
      .order('event_time', { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error.message);
    } else {
      const normalized = (data ?? []).map((row) => ({
        ...row,
        tag: Array.isArray(row.tag)
          ? row.tag
          : typeof row.tag === 'string'
            ? row.tag.replace(/[{}"]/g, '').split(',').map((v) => v.trim()).filter(Boolean)
            : []
      })) as (RoomPost & { tag: string[] })[];
      setListings(normalized);
      if (count !== null) {
        setTotalPosts(count);
      }
    }
    setLoading(false);
  }, [supabase, searchQuery, selectedRegions, selectedGenders]);

  // 2. 필터나 페이지가 변경될 때마다 데이터 다시 불러오기
  useEffect(() => {
    fetchListings(currentPage);
  }, [currentPage, fetchListings]);

  // 필터 변경 핸들러
  const toggleFilter = (tag: string, type: 'region' | 'gender') => {
    const setter = type === 'region' ? setSelectedRegions : setSelectedGenders;
    setter((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    // 필터 변경 시 URL의 페이지를 1로 설정
    handlePageChange(1);
  };
  
  // 페이지 변경 핸들러 (URL을 직접 변경하도록 수정)
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // URL을 변경하여 페이지를 이동합니다. 이것이 페이지뷰를 발생시킵니다.
      // useSearchParams를 사용하여 기존 쿼리 파라미터를 유지하면서 'page'만 업데이트
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`?${newSearchParams.toString()}`);
      window.scrollTo(0, 0);
    }
  };

  // 검색어 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // 검색어 입력 시 첫 페이지로 이동
    handlePageChange(1);
  }

  // 기타 렌더링 헬퍼 함수들 (기존과 동일)
  const renderTime = (p: RoomPost) =>
    p.event_time ? formatDistanceToNow(new Date(p.event_time), { addSuffix: true }) : '';

  const renderGender = (tags: string[]) => {
    if (tags.includes('female'))
      return <span className="flex items-center gap-1 text-pink-500 font-medium"><Venus className="w-3 h-3" />{t('female')}</span>;
    if (tags.includes('male'))
      return <span className="flex items-center gap-1 text-blue-500 font-medium"><Mars className="w-3 h-3" />{t('male')}</span>;
    return null;
  };

  const renderSourceTag = (tags: string[]) => {
    if (tags.includes('korea')) return t('site.korea');
    if (tags.includes('canada')) return t('site.canada');
    if (tags.includes('japan')) return t('site.japan');
    return '';
  };

  return (
    <main className="w-full max-w-screen-lg mx-auto px-2 py-2 pt-6">
      {/* 공지, 헤더, 검색/필터 UI (기존과 동일) */}
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
          <p className="text-sm leading-relaxed whitespace-pre-line">{t('roompage_disclaimer')}</p>
        </div>
      </div>
      <header className="mb-4 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">🏠 {t('roomListTitle')}</h1>
      </header>
      <section className="bg-white border p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={t('roompage_searchbar')}
            value={searchQuery}
            onChange={handleSearchChange} // 수정된 핸들러 사용
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-teal-500"
          />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {['korea', 'canada', 'japan'].map((r) => {
                const sel = selectedRegions.includes(r);
                return <button key={r} onClick={() => toggleFilter(r, 'region')} className={`px-3 py-1 rounded-full border transition ${sel ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-700 border-gray-300'} hover:border-teal-500 hover:text-teal-600`}>{t(`site.${r}`)}</button>;
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {['male', 'female'].map((g) => {
                const sel = selectedGenders.includes(g);
                return <button key={g} onClick={() => toggleFilter(g, 'gender')} className={`px-3 py-1 rounded-full border transition ${sel ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'} hover:border-blue-500 hover:text-blue-600`}>{t(g)}</button>;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 리스트, 로딩 및 Empty 상태 처리 */}
      {loading ? (
        <p className="py-20 text-center text-base">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="py-20 text-center text-gray-500 text-base">No listings found.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {listings.map((post) => (
              <li key={post.id} className="px-3 py-2 hover:bg-gray-50 transition group">
                <div className="flex flex-row items-center w-full">
                  <a href={post.link ?? '#'} target="_blank" rel="noreferrer" className="font-semibold text-sm group-hover:underline text-blue-700 flex-1 min-w-0">{post.title}</a>
                  {post.source && <span className="flex items-center gap-1 text-xs italic text-gray-500 flex-shrink-0 ml-3"><Info className="w-3.5 h-3.5 text-gray-400" />{post.source}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-0.5">
                  {post.price && <span className="text-gray-600">{`CA${post.price}`}</span>}
                  <span>{renderTime(post)}</span>
                  <span>· {renderSourceTag(post.tag)}</span>
                  <span className="flex gap-1 items-center">{renderGender(post.tag)}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* --- UI가 통일된 페이지네이션 컨트롤 --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

// VancouverRoomPage 컴포넌트를 Suspense로 감싸줍니다.
export default function VancouverRoomPage() {
  const t = useTranslations(); // fallback 메시지를 위해 번역 훅을 여기서도 사용 (common.json에서 직접 키 사용)

  return (
    <Suspense fallback={
      <div className="py-20 text-center text-base">
        {t("loading")} {/* common.json에 'loading' 키가 있다고 가정 */}
      </div>
    }>
      <VancouverRoomContent />
    </Suspense>
  );
}
