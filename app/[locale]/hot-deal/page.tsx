'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";
import { Edit2, Trash2, Flame } from "lucide-react";

const NO_THUMB_URL = "/images/no_thumb.png";

type HotDealPost = Pick<
  Database["public"]["Tables"]["hot_deal_posts"]["Row"],
  "id" | "title" | "content" | "thumbnail_url" | "created_at" | "user_nickname"
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
      .from("hot_deal_posts")
      .select("id, title, content, thumbnail_url, created_at, user_nickname")
      .order("created_at", { ascending: false });
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
    <div className="pt-16 px-4 lg:px-0 max-w-5xl mx-auto">
      <h1 className="flex items-center text-3xl font-bold mb-1">
        {t("hotDeals")} <span className="ml-2">🔥</span>
      </h1>
      <p className="text-base text-gray-600 mb-6">{t("hotDealsSubtitle")}</p>

      <ul className="space-y-4">
        {posts.map((p) => (
          <li
            key={p.id}
            className="relative bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="grid grid-cols-[auto,1fr,auto] grid-rows-[auto,auto,auto] gap-x-4 gap-y-1 items-start">
              {/* 썸네일 */}
              <div className="col-start-1 row-span-3 w-24 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
                <Image
                  src={p.thumbnail_url || NO_THUMB_URL}
                  alt={p.thumbnail_url ? p.title : `Thumbnail for ${p.title}`}
                  width={96}
                  height={80}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              {/* 제목 */}
              <h2 className="row-start-1 col-start-2 text-lg font-semibold truncate">
                {p.title}
              </h2>

              {/* 수정/삭제 버튼 */}
              <div className="row-start-1 col-start-3 justify-self-end flex space-x-2">
                {/* [수정1] Edit2: 쿼리스트링 기반으로 수정 라우팅 */}
                <Edit2
                  size={18}
                  className="cursor-pointer hover:text-teal-600"
                  onClick={() => router.push(`/${locale}/hot-deal/write?id=${p.id}`)}
                />
                <Trash2
                  size={18}
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => handleDelete(p.id)}
                />
              </div>

              {/* 내용 */}
              <p className="row-start-2 col-start-2 text-sm text-gray-600 line-clamp-2">
                {p.content}
              </p>

              {/* 날짜 */}
              <time className="row-start-3 col-start-2 text-xs text-gray-400">
                {new Date(p.created_at).toLocaleString(locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>

              {/* 작성자 */}
              <span className="row-start-3 col-start-3 justify-self-end text-xs text-gray-400">
                by {p.user_nickname || t("anonymous")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
