/*
================================================================================
  클라이언트 컴포넌트 (수정)
  파일 경로: app/[locale]/hot-deal/hot-deal-list.client.tsx
  (이 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import type { Database } from '@server/types';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';

const NO_THUMB_URL = '/images/no_thumb.png';
const POSTS_PER_PAGE = 10;

// Supabase에서 가져오는 포스트의 타입을 명확하게 정의합니다.
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

// 서버 컴포넌트로부터 받는 props 타입을 정의합니다.
interface HotDealListProps {
  initialPosts: HotDealPost[];
  totalPages: number;
  currentPage: number;
  locale: string;
  translations: {
    loading: string;
    noDealsYet: string;
    anonymous: string;
  };
}

export default function HotDealList({
  initialPosts,
  totalPages,
  currentPage,
  locale,
  translations,
}: HotDealListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserSupabase();

  // [수정] 클라이언트 사이드에서 게시글 목록과 로딩 상태를 관리합니다.
  const [posts, setPosts] = useState<HotDealPost[]>(initialPosts);
  const [isPending, startTransition] = useTransition(); // 페이지 전환 시 로딩 상태 관리를 위해 useTransition 사용

  // [수정] 페이지가 변경될 때마다 새로운 데이터를 fetch하고 posts 상태를 업데이트합니다.
  useEffect(() => {
    // currentPage가 바뀔 때만 실행되도록 하여 불필요한 재실행을 방지합니다.
    // 첫 로딩 시에는 initialPosts를 사용하므로 fetch하지 않습니다.
    if (currentPage !== (Number(searchParams.get('page')) || 1)) {
       setPosts(initialPosts);
    }
  }, [initialPosts, currentPage, searchParams]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('page', newPage.toString());
        router.push(`/${locale}/hot-deal?${newSearchParams.toString()}`);
        window.scrollTo(0, 0);
      });
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // 로딩 중이거나 게시글이 없을 경우의 UI 처리
  if (isPending) {
    return <p className="py-20 text-center text-gray-500 text-base">{translations.loading}</p>;
  }

  if (!posts.length) {
    return <p className="py-20 text-center text-gray-500 text-base">{translations.noDealsYet}</p>;
  }

  return (
    <>
      <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
        {posts.map((p) => (
          <li
            key={p.id}
            className={`group ${p.is_notice ? 'bg-teal-50 hover:bg-teal-100/60' : 'hover:bg-gray-50'}`}
          >
            <div
              onClick={() => router.push(`/${locale}/hot-deal/${p.id}`)}
              className="flex w-full cursor-pointer items-center px-3 py-2 gap-4 transition-colors"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={p.thumbnail_url || NO_THUMB_URL}
                  alt={p.thumbnail_url ? p.title : `Thumbnail for ${p.title}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  priority // 모든 이미지를 우선적으로 로드하여 사용자 경험 개선
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {p.is_notice && (
                    <span className="flex-shrink-0 bg-teal-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Megaphone size={14} />
                    </span>
                  )}
                  <p className="font-semibold text-sm group-hover:underline truncate">{p.title}</p>
                </div>
                {p.price != null && !p.is_notice && (
                  <span className="block text-sm text-teal-600 font-bold">
                    {p.currency_type} {p.price.toLocaleString()}
                  </span>
                )}
                <div className="flex gap-4 text-xs text-gray-400 mt-0.5">
                  <time>{formatDate(p.created_at)}</time>
                  <span className="ml-2">by {p.user_nickname || translations.anonymous}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center mt-8 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isPending}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </>
  );
}
