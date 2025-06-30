// app/[locale]/hot-deal/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";

const NO_THUMB_URL = "/images/no_thumb.png";

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

export default function HotDealPage() {
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const t = useTranslations('hotdeal');
  const supabase = createBrowserSupabase();

  const [posts, setPosts] = useState<HotDealPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) 데이터 불러오기
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("hot_deal_posts")
        .select("id, title, price, currency_type, thumbnail_url, created_at, user_nickname")
        .order("created_at", { ascending: false });

      if (!error && data) setPosts(data);
      setLoading(false);
    })();
  }, [supabase]);

  // 2) 글쓰기 버튼 핸들러
  const handleWrite = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const writePath = `/${locale}/hot-deal/write`;

    if (session) {
      router.push(writePath);
    } else {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(writePath)}`);
    }
  };

  // 3) 로딩 / Empty 상태
  if (loading) {
    return <p className="py-20 text-center text-base">{t("loading")}</p>;
  }
  if (posts.length === 0) {
    return (
      <p className="py-20 text-center text-gray-500 text-base">
        {t("noDealsYet")}
      </p>
    );
  }

  // 4) 날짜 포맷 헬퍼
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // 5) 렌더링
  return (
    <div className="pt-2 px-2 w-full max-w-screen-lg mx-auto">
      {/* --- ▼▼▼ UI 수정이 적용된 부분입니다 ▼▼▼ --- */}
      <div className="mb-4">
        {/* Line 1: Main Title & Icon */}
        <div className="flex items-center gap-1.5">
          <h1 className="text-4xl font-bold tracking-tight">{t("hotDeals")}</h1>
          <span className="text-3xl">🔥</span>
        </div>
        
        {/* Line 2: Subtitle & Write Button */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 mt-2">
            <p className="text-base text-gray-500">{t('hotDealsSubtitle')}</p>
            <span
              onClick={handleWrite}
              className="flex items-center gap-1.5 cursor-pointer select-none text-gray-600 font-semibold text-base hover:text-teal-500 transition"
            >
              <Pencil size={16} />
              {t("write.postButton")}
            </span>
        </div>
      </div>
      {/* --- ▲▲▲ UI 수정이 적용된 부분입니다 ▲▲▲ --- */}


      <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
        {posts.map((p) => (
          <li key={p.id} className="group">
            <div
              onClick={() => router.push(`/${locale}/hot-deal/${p.id}`)}
              className="flex w-full cursor-pointer items-center px-3 py-2 gap-4 hover:bg-gray-50 transition"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={p.thumbnail_url || NO_THUMB_URL}
                  alt={p.thumbnail_url ? p.title : `Thumbnail for ${p.title}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate text-sm group-hover:underline">
                    {p.title}
                  </span>
                </div>
                <span className="text-sm text-teal-600 font-bold">
                  {p.currency_type} {p.price}
                </span>
                <div className="flex gap-4 text-xs text-gray-400 mt-0.5">
                  <time>{formatDate(p.created_at)}</time>
                  <span className="ml-2">
                    by {p.user_nickname || t("anonymous")}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
