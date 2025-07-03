// app/[locale]/hot-deal/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";
import { Pencil, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";

const NO_THUMB_URL = "/images/no_thumb.png";
const POSTS_PER_PAGE = 10;

type HotDealPost = Pick<
  Database['public']['Tables']['hot_deal_posts']['Row'],
  | 'id'
  | 'title'
  | 'price'
  | 'currency_type'
  | 'thumbnail_url'
  | 'created_at'
  | 'user_nickname'
  | 'is_notice'
>;

function HotDealContent() {
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('hotdeal');
  const supabase = createBrowserSupabase();

  const [posts, setPosts] = useState<HotDealPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true);
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("hot_deal_posts")
      .select("id, title, price, currency_type, thumbnail_url, created_at, user_nickname, is_notice")
      .order("is_notice", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) setPosts(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const getTotalCount = async () => {
      const { count, error } = await supabase.from('hot_deal_posts').select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setTotalPosts(count);
      }
    };
    getTotalCount();
  }, [supabase]);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  const handleWrite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const writePath = `/${locale}/hot-deal/write`;
    if (session) {
      router.push(writePath);
    } else {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(writePath)}`);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`/${locale}/hot-deal?${newSearchParams.toString()}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    // [수정됨] 이 페이지의 핵심 콘텐츠 전체를 <main> 태그로 감쌉니다.
    // 기존의 최상위 div를 main으로 변경하여 시맨틱 의미를 강화합니다.
    <main className="relative pt-6 px-2 w-full max-w-screen-lg mx-auto min-h-screen pb-24">
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{t("hotDeals")}</h1>
          <span className="text-2xl">🔥</span>
        </div>
        <div className="flex items-center justify-between gap-x-4 mt-2">
            <p className="text-sm text-gray-500 min-w-0">{t('hotDealsSubtitle')}</p>
        </div>
      </div>

      {loading ? (
        <p className="py-20 text-center text-base">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="py-20 text-center text-gray-500 text-base">{t("noDealsYet")}</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {posts.map((p) => (
              <li key={p.id} className={`group ${p.is_notice ? 'bg-teal-50 hover:bg-teal-100/60' : 'hover:bg-gray-50'}`}>
                <div onClick={() => router.push(`/${locale}/hot-deal/${p.id}`)} className="flex w-full cursor-pointer items-center px-3 py-2 gap-4 transition-colors">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center">
                    <Image src={p.thumbnail_url || NO_THUMB_URL} alt={p.thumbnail_url ? p.title : `Thumbnail for ${p.title}`} width={64} height={64} className="object-cover w-full h-full" priority/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {p.is_notice && (
                        <span className="flex-shrink-0 bg-teal-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Megaphone size={14} />
                        </span>
                      )}
                      <span className="font-semibold text-sm group-hover:underline">{p.title}</span>
                    </div>
                    {p.price != null && !p.is_notice && (
                      <span className="block text-sm text-teal-600 font-bold">{p.currency_type} {p.price}</span>
                    )}
                    <div className="flex gap-4 text-xs text-gray-400 mt-0.5">
                      <time>{formatDate(p.created_at)}</time>
                      <span className="ml-2">by {p.user_nickname || t("anonymous")}</span>
                    </div>
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

export default function HotDealPage() {
  const t = useTranslations('hotdeal');
  return (
    <Suspense fallback={<div className="py-20 text-center text-base">{t("loading")}</div>}>
      <HotDealContent />
    </Suspense>
  );
}
