'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";
import { Edit2, Trash2, Pencil } from "lucide-react";


const NO_THUMB_URL = "/images/no_thumb.png";

type HotDealPost = Pick<
  Database['public']['Tables']['hot_deal_posts']['Row'],
  'id' | 'title' | 'price' | 'currency_type' | 'thumbnail_url' | 'created_at' | 'user_nickname'
>;

export default function HotDealPage() {
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const t = useTranslations();
  const supabase = createBrowserSupabase();

  const [posts, setPosts] = useState<HotDealPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 게시글 목록 조회
  const fetchPosts = async () => {
    const { data, error } = await supabase
    .from('hot_deal_posts')
    .select('id, title, price, currency_type, thumbnail_url, created_at, user_nickname')
    .order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [supabase]);

  // 게시글 삭제
  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return;
    const { error } = await supabase
      .from("hot_deal_posts")
      .delete()
      .eq("id", id);
    if (error) {
      alert(t("deleteError"));
    } else {
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  // 날짜 포맷 함수 (간략 표기)
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

  return (
    <div className="pt-2 px-2 w-full max-w-screen-lg mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{t("hotDeals")}</h1>
          <span className="text-2xl">🔥</span>
        </div>
        {/* 글쓰기: 텍스트+아이콘, 버튼X */}
        <div>
          <span
            onClick={() => router.push(`/${locale}/hot-deal/write`)}
            className="
              flex items-center gap-1 cursor-pointer select-none
              text-gray-600 font-semibold text-base
              hover:text-teal-500 hover:underline transition
              "
          >
            <Pencil size={18} className="mb-[1px]" />
            {t("HotDealwritebutton")}
          </span>
        </div>
      </div>
      {/* 리스트 */}
      <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
        {posts.map((p) => (
          <li key={p.id} className="group ...">
            <div
              onClick={() => router.push(`/${locale}/hot-deal/${p.id}`)}
              className="flex w-full cursor-pointer items-center px-3 py-2 gap-4 hover:bg-gray-50 transition"
            >

            {/* 썸네일 */}
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
            {/* 본문 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate text-sm group-hover:underline">{p.title}</span>
              </div>
              <span className="text-sm text-gray-600 font-medium">{p.currency_type} {p.price}</span>
              <div className="flex gap-4 text-xs text-gray-400 mt-0.5">
                <time>{formatDate(p.created_at)}</time>
                <span className="ml-2">by {p.user_nickname || t("anonymous")}</span>
              </div>
            </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
