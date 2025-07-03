// app/[locale]/vancouver/community/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";
import { Pencil, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

const POSTS_PER_PAGE = 15;

type CommunityPost = Pick<
  Database['public']['Tables']['vancouver_community']['Row'],
  | 'id'
  | 'title'
  | 'created_at'
  | 'user_nickname'
  | 'user_id'
  | 'is_notice'
>;

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

  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true);
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("vancouver_community")
      .select("id, title, created_at, user_nickname, user_id, is_notice")
      .order("is_notice", { ascending: false })
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

  useEffect(() => {
    const getTotalCount = async () => {
      const { count, error } = await supabase.from('vancouver_community').select('*', { count: 'exact', head: true });
      if (error) { console.error("Error fetching total count:", error); } 
      else if (count !== null) { setTotalPosts(count); }
    };
    getTotalCount();
  }, [supabase]);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  const handleWrite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const writePath = `/${locale}/vancouver/community/write`;
    if (session) { router.push(writePath); } 
    else { router.push(`/${locale}/login?redirect=${encodeURIComponent(writePath)}`); }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString(locale, { year: "numeric", month: "short", day: "numeric" });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`/${locale}/vancouver/community?${newSearchParams.toString()}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    // [수정됨] 이 페이지의 핵심 콘텐츠 전체를 <main> 태그로 감쌉니다.
    // 기존의 최상위 div를 main으로 변경하여 시맨틱 의미를 강화합니다.
    <main className="relative pt-2 px-2 w-full max-w-screen-lg mx-auto min-h-screen pb-24">
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm text-gray-500 min-w-0 mt-2">{t('subtitle')}</p>
      </div>

      {loading ? (
        <p className="py-20 text-center text-base">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="py-20 text-center text-gray-500 text-base">{t("noPostsYet")}</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {posts.map((p) => (
              <li key={p.id} className={`group ${p.is_notice ? 'bg-teal-50 hover:bg-teal-100/60' : 'hover:bg-gray-50'}`}>
                <div onClick={() => router.push(`/${locale}/vancouver/community/${p.id}`)} className="w-full cursor-pointer px-4 py-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {p.is_notice && (
                        <span className="flex-shrink-0 bg-teal-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Megaphone size={14} />
                        </span>
                      )}
                      <p className="font-semibold text-sm group-hover:underline">{p.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1.5 pl-1">
                    <span>by {p.user_nickname || t("anonymous")}</span>
                    <time>{formatDate(p.created_at)}</time>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-center items-center mt-8 space-x-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20} /></button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20} /></button>
          </div>
        </>
      )}

      <button onClick={handleWrite} className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" aria-label="Write a new post"><Pencil size={24} /></button>
    </main>
  );
}

export default function CommunityPage() {
  const t = useTranslations('community');
  return (
    <Suspense fallback={<div className="py-20 text-center text-base">{t("loading")}</div>}>
      <CommunityContent />
    </Suspense>
  );
}
