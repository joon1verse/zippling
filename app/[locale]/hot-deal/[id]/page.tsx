// app/[locale]/hot-deal/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@server/supabaseProvider';
import type { Database } from '@server/types';
import DOMPurify from 'dompurify';
import { ArrowLeft } from 'lucide-react';

type HotDealPost = Database['public']['Tables']['hot_deal_posts']['Row'];

export default function HotDealDetailPage() {
  const { id, locale } = useParams() as { id: string; locale: string };
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [post, setPost] = useState<HotDealPost | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from('hot_deal_posts')
        .select('*')
        .eq('id', Number(id))
        .single();
      setPost(data);
    };
    fetchPost();
  }, [id, supabase]);

  if (!post) {
    return <p className="py-20 text-center text-gray-500">Loading...</p>;
  }

  const safeContent = DOMPurify.sanitize(post.content || '');

  return (
    // 1) 전체 페이지 배경을 연한 회색으로
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* 2) 뒤로가기 버튼: 콘텐츠 밖, 좌상단 */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          목록으로 돌아가기
        </button>

        {/* 3) 본문 영역: 배경만 흰색, 그림자·둥근 모서리 없음 */}
        <article className="bg-white px-6 py-8">
          {/* 4) 제목 */}
          <h1 className="text-3xl font-semibold mb-2 text-gray-900">
            {post.title}
          </h1>
            {/* PRICE */}
            {post.price != null && (
              <p className="text-2xl font-bold text-green-600 mb-4">
                {new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: 'CAD',
                  minimumFractionDigits: 0
                }).format(post.price)}
              </p>
            )}
          {/* 5) 작성자·날짜 */}
          <div className="text-sm text-gray-500 mb-6">
            by {post.user_nickname || 'Anonymous'} ·{' '}
            {new Date(post.created_at).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          {/* 6) 구분선 */}
          <hr className="border-gray-200 mb-6" />
          {/* 7) 본문 (sanitize 된 HTML) */}
          <div
            className="prose prose-lg max-w-none leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        </article>
      </div>
    </div>
  );
}
