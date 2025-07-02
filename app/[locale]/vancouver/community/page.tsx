// app/[locale]/vancouver/community/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";
import { Pencil, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

// 페이지 당 게시물 수
const POSTS_PER_PAGE = 15; 

// 커뮤니티 게시물 타입 정의 (vancouver_community 테이블 스키마에 맞게 수정)
type CommunityPost = Pick<
  Database['public']['Tables']['vancouver_community']['Row'],
  | 'id'
  | 'title'
  | 'created_at'
  | 'user_nickname'
  | 'content'
  | 'user_id' // 게시자 식별을 위한 user_id 필드 추가
>;

// useSearchParams를 사용하는 실제 콘텐츠를 담을 내부 컴포넌트
function CommunityContent() {
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('community');
  const supabase = createBrowserSupabase();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 1) 데이터 불러오기 (페이지네이션 적용)
  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true);
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    // Supabase 테이블을 'vancouver_community'로 변경
    const { data, error } = await supabase
      .from("vancouver_community") 
      .select("id, title, created_at, user_nickname, user_id") // user_id도 함께 불러옵니다.
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching community posts:", error);
      setPosts([]);
    } else {
      setPosts(data as CommunityPost[] || []);
    }
    setLoading(false);
  }, [supabase]);

  // 전체 게시물 수 가져오기 (최초 1회만)
  useEffect(() => {
    const getTotalCount = async () => {
      // Supabase 테이블을 'vancouver_community'로 변경
      const { count, error } = await supabase
        .from('vancouver_community')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error("Error fetching total count:", error);
      } else if (count !== null) {
        setTotalPosts(count);
      }
    };
    getTotalCount();
  }, [supabase]);

  // 페이지가 변경될 때마다 데이터 다시 불러오기
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  // 2) 글쓰기 버튼 핸들러 (경로 수정)
  const handleWrite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const writePath = `/${locale}/vancouver/community/write`;
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
    });

  // 4) 페이지 변경 핸들러 (경로 수정)
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`/${locale}/vancouver/community?${newSearchParams.toString()}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="relative pt-2 px-2 w-full max-w-screen-lg mx-auto min-h-screen pb-24">
      {/* 페이지 헤더 */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <span className="text-2xl">💬</span>
        </div>
        <div className="flex items-center justify-between gap-x-4 mt-2">
            <p className="text-sm text-gray-500 min-w-0 truncate">{t('subtitle')}</p>
        </div>
      </div>

      {/* 로딩 및 Empty 상태 처리 */}
      {loading ? (
        <p className="py-20 text-center text-base">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="py-20 text-center text-gray-500 text-base">{t("noPostsYet")}</p>
      ) : (
        <>
          {/* 게시물 목록 */}
          <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {posts.map((p) => (
              <li key={p.id} className="group">
                {/* 게시물 상세 페이지로 이동하는 링크 (경로 수정) */}
                <div onClick={() => router.push(`/${locale}/vancouver/community/${p.id}`)}
                  className="w-full cursor-pointer px-4 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate text-sm sm:text-base group-hover:underline">{p.title}</p>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 mt-1">
                    <span>by {p.user_nickname || t("anonymous")}</span>
                    <time>{formatDate(p.created_at)}</time>
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

// CommunityPage 컴포넌트를 Suspense로 감싸줍니다.
export default function CommunityPage() {
  const t = useTranslations('community');

  return (
    <Suspense fallback={
      <div className="py-20 text-center text-base">
        {t("loading")}
      </div>
    }>
      <CommunityContent />
    </Suspense>
  );
}
