// app/[locale]/hot-deal/write/WriteForm.tsx
"use client";

import { useState, useEffect } from "react";
import {
  useRouter,
  useSearchParams,
  useParams,
} from "next/navigation";
import { createBrowserSupabase } from "@server/supabaseBrowserClient";
import type { Database } from "@server/types";
import { useTranslations } from "next-intl";

// [1] 타입 정의
type HotDealPost = Database["public"]["Tables"]["hot_deal_posts"]["Row"];

export default function WriteForm() {
  const { locale } = useParams() as { locale: string };
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const idParam = searchParams.get("id");
  const isEdit = Boolean(idParam);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // [3] 수정모드 - 기존 글 정보 가져오기
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("hot_deal_posts")
        .select("title, content, thumbnail_url")
        .eq("id", Number(idParam))
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setTitle(data.title);
        setContent(data.content);
        setThumbnailUrl(data.thumbnail_url ?? "");
      }
      setLoading(false);
    })();
  }, [isEdit, idParam, supabase]);

  // [4] 저장/수정 submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isEdit) {
      const { error: updateError } = await supabase
        .from("hot_deal_posts")
        .update({
          title,
          content,
          thumbnail_url: thumbnailUrl || null,
        })
        .eq("id", Number(idParam));

      if (updateError) {
        setError(updateError.message);
      } else {
        router.push(`/${locale}/hot-deal`);
      }
    } else {
      const { error: insertError } = await supabase
        .from("hot_deal_posts")
        .insert([
          {
            title,
            content,
            thumbnail_url: thumbnailUrl || null,
          },
        ]);

      if (insertError) {
        setError(insertError.message);
      } else {
        router.push(`/${locale}/hot-deal`);
      }
    }

    setLoading(false);
  };

  return (
    <div className="pt-16 px-4 max-w-2xl mx-auto">
      {/* 제목 */}
      <h1 className="text-3xl font-bold mb-6">
        {isEdit
          ? t("editHotDeal")
          : t("writeHotDeal")
        }
      </h1>

      {/* 에러 메시지 */}
      {error && (
        <p className="mb-4 text-red-600">
          {t("errorPrefix")} {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 타이틀 입력 */}
        <div>
          <label className="block mb-1 font-medium">
            {t("titleLabel")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <label className="block mb-1 font-medium">
            {t("contentLabel")}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* 썸네일 URL 입력 */}
        <div>
          <label className="block mb-1 font-medium">
            {t("thumbnailUrlLabel")}
          </label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder={t("thumbnailUrlPlaceholder")}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            {t("thumbnailUrlHelp")}
          </p>
        </div>

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {loading
            ? t("saving")
            : isEdit
            ? t("update")
            : t("save")
          }
        </button>
      </form>
    </div>
  );
}
