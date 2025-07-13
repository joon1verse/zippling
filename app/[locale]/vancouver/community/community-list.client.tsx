// app/[locale]/vancouver/community/community-list.client.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import type { Database } from '@server/types';
import { Megaphone, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

type CommunityPost = Pick<
  Database['public']['Tables']['vancouver_community']['Row'],
  'id' | 'title' | 'created_at' | 'user_nickname' | 'is_notice'
>;

interface CommunityListProps {
  locale: string;
  initialPosts: CommunityPost[];
  totalPosts: number;
  postsPerPage: number;
  anonymousText: string;
  noPostsYetText: string;
  loadingText: string;
}

// 게시글 목록과 페이지네이션을 담당하는 클라이언트 컴포넌트
export default function CommunityList({
  locale,
  initialPosts,
  totalPosts,
  postsPerPage,
  anonymousText,
  noPostsYetText,
  loadingText,
}: CommunityListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserSupabase();

  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);

  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true);
    const from = (page - 1) * postsPerPage;
    const to = from + postsPerPage - 1;

    const { data, error } = await supabase
      .from("vancouver_community")
      .select("id, title, created_at, user_nickname, is_notice")
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
  }, [supabase, postsPerPage]);

  // URL의 page 쿼리 파라미터가 변경될 때마다 게시글을 다시 불러옵니다.
  useEffect(() => {
    // 첫 페이지는 서버에서 이미 데이터를 받아왔으므로, 2페이지 이상일 때만 클라이언트에서 fetch합니다.
    if (currentPage > 1) {
      fetchPosts(currentPage);
    } else {
      // 1페이지로 돌아올 경우, 서버에서 받은 초기 데이터로 설정합니다.
      setPosts(initialPosts);
    }
  }, [currentPage, fetchPosts, initialPosts]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`/${locale}/vancouver/community?${newSearchParams.toString()}`);
      window.scrollTo(0, 0);
    }
  };
  
  const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toLocaleString(locale, { year: "numeric", month: "short", day: "numeric" }) : '';

  if (loading) {
    return <p className="py-20 text-center text-base">{loadingText}</p>;
  }

  if (posts.length === 0 && !loading) {
    return <p className="py-20 text-center text-gray-500 text-base">{noPostsYetText}</p>;
  }

  return (
    <>
      <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
        {posts.map((p) => (
          <li key={p.id} className={`group ${p.is_notice ? 'bg-teal-50 hover:bg-teal-100/60' : 'hover:bg-gray-50'}`}>
            <Link href={`/${locale}/vancouver/community/${p.id}`} className="block w-full cursor-pointer px-4 py-3 transition-colors">
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
                <span>by {p.user_nickname || anonymousText}</span>
                <time>{formatDate(p.created_at)}</time>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  );
}

// 글쓰기 버튼 컴포넌트
interface WriteButtonProps {
  locale: string;
}

export function WriteButton({ locale }: WriteButtonProps) {
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const handleWrite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const writePath = `/${locale}/vancouver/community/write`;
    if (session) {
      router.push(writePath);
    } else {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(writePath)}`);
    }
  };

  return (
    <button
      onClick={handleWrite}
      className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      aria-label="Write a new post"
    >
      <Pencil size={24} />
    </button>
  );
}
