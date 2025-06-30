// app/[locale]/hot-deal/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from "react"; // Suspense 임포트
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";

const NO_THUMB_URL = "/images/no_thumb.png";
const POSTS_PER_PAGE = 10; // 페이지 당 게시물 수

type HotDealPost = Pick<
  Database['public']['Tables']['hot_deal_posts']['Row'],
  | 'id'
  | 'title'
  | 'price'
  | 'currency_type'
  | 'thumbnail_url'
  | 'created_at'
  | 'user_nickname'
>;

// useSearchParams를 사용하는 실제 콘텐츠를 담을 내부 컴포넌트
// 이 컴포넌트가 HotDealPage의 모든 기존 로직과 JSX를 포함합니다.
function HotDealContent() {
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const searchParams = useSearchParams(); // 이 훅이 Suspense로 감싸져야 할 주된 이유입니다.
  const t = useTranslations('hotdeal');
  const supabase = createBrowserSupabase();

  const [posts, setPosts] = useState<HotDealPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  // Get current page from URL or default to 1
  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 1) 데이터 불러오기 (페이지네이션 적용)
  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true);
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("hot_deal_posts")
      .select("id, title, price, currency_type, thumbnail_url, created_at, user_nickname")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) setPosts(data);
    setLoading(false);
  }, [supabase]);

  // 전체 게시물 수 가져오기 (최초 1회만)
  useEffect(() => {
    const getTotalCount = async () => {
      const { count, error } = await supabase
        .from('hot_deal_posts')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setTotalPosts(count);
      }
    };
    getTotalCount();
  }, [supabase]);

  // 페이지가 변경될 때마다 데이터 다시 불러오기 (currentPage는 이제 URL에서 파생됨)
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  // 2) 글쓰기 버튼 핸들러
  const handleWrite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const writePath = `/${locale}/hot-deal/write`;
    if (session) {
      router.push(writePath);
    } else {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(writePath)}`);
    }
  };

  // 3) 날짜 포맷 헬퍼
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(locale, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  // 4) 페이지 변경 핸들러 - URL을 업데이트하도록 수정
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Construct new URL with updated page query parameter
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`/${locale}/hot-deal?${newSearchParams.toString()}`);
      window.scrollTo(0, 0); // 페이지 변경 시 맨 위로 스크롤
    }
  };

  return (
    // relative 클래스 추가: 글쓰기 버튼의 기준점이 되도록 함
    <div className="relative pt-2 px-2 w-full max-w-screen-lg mx-auto min-h-screen pb-24">
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{t("hotDeals")}</h1>
          <span className="text-2xl">🔥</span>
        </div>
        <div className="flex items-center justify-between gap-x-4 mt-2">
            <p className="text-sm text-gray-500 min-w-0 truncate">{t('hotDealsSubtitle')}</p>
        </div>
      </div>

      {/* 로딩 및 Empty 상태 처리 */}
      {loading ? (
        <p className="py-20 text-center text-base">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="py-20 text-center text-gray-500 text-base">{t("noDealsYet")}</p>
      ) : (
        <>
          {/* 게시물 목록 */}
          <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {posts.map((p) => (
              <li key={p.id} className="group">
                <div onClick={() => router.push(`/${locale}/hot-deal/${p.id}`)}
                  className="flex w-full cursor-pointer items-center px-3 py-2 gap-4 hover:bg-gray-50 transition">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center">
                    <Image src={p.thumbnail_url || NO_THUMB_URL} alt={p.thumbnail_url ? p.title : `Thumbnail for ${p.title}`} width={64} height={64} className="object-cover w-full h-full" priority/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold truncate text-sm group-hover:underline">{p.title}</span>
                    <span className="block text-sm text-teal-600 font-bold">{p.currency_type} {p.price}</span>
                    <div className="flex gap-4 text-xs text-gray-400 mt-0.5">
                      <time>{formatDate(p.created_at)}</time>
                      <span className="ml-2">by {p.user_nickname || t("anonymous")}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 페이지네이션 컨트롤 */}
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
        </>
      )}

      {/* 글쓰기 버튼 (Floating Action Button) */}
      <button
        onClick={handleWrite}
        className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        aria-label="Write a new post"
      >
        <Pencil size={24} />
      </button>
    </div>
  );
}

// HotDealPage 컴포넌트를 Suspense로 감싸줍니다.
export default function HotDealPage() {
  const t = useTranslations('hotdeal'); // fallback 메시지를 위해 번역 훅을 여기서도 사용

  return (
    <Suspense fallback={
      <div className="py-20 text-center text-base">
        {t("loading")} {/* 로딩 메시지 */}
      </div>
    }>
      <HotDealContent />
    </Suspense>
  );
}
