// app/[locale]/vancouver/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import { Home, Briefcase, MessageSquare, Flame, Building2, ShoppingCart, Users, ChevronRight, Compass } from 'lucide-react';
import type { Database } from '@server/types';

// 게시글 목록에 사용할 공용 타입 정의
type Post = {
  id: number | string;
  title: string;
  created_at?: string;
  link?: string; // '방 구하기'용 외부 링크
};

// 새로운 게시판 미리보기 섹션 컴포넌트 Props 타입
interface BoardPreviewRowProps {
  title: string;
  posts: Post[];
  boardHref: string;
  postBaseHref: string;
  locale: string;
  icon: React.ElementType;
  iconColor: string;
  isExternalLink?: boolean;
  disabled?: boolean;
}

/**
 * 각 게시판의 최신글 목록을 보여주는 새로운 레이아웃 컴포넌트
 */
const BoardPreviewRow: React.FC<BoardPreviewRowProps> = ({ title, posts, boardHref, postBaseHref, locale, icon: Icon, iconColor, isExternalLink = false, disabled = false }) => {
    const t = useTranslations('van_main');
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { month: '2-digit', day: '2-digit' });
    };

    // 게시글이 24시간 이내에 작성되었는지 확인하는 함수
    const isNewPost = (dateString?: string) => {
        if (!dateString) return false;
        const postDate = new Date(dateString);
        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        return (now.getTime() - postDate.getTime()) < oneDayInMs;
    };

    return (
        <div className={`flex flex-col md:flex-row bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden ${disabled ? 'opacity-60' : ''}`}>
            {/* 왼쪽 버튼 영역 (사용자 수정 스타일 유지) */}
            <Link href={disabled ? '#' : boardHref} className={`group md:w-52 flex-shrink-0 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-200/80 bg-gray-100 transition-colors duration-200 hover:bg-teal-100/30 ${disabled ? 'cursor-not-allowed bg-gray-100 hover:bg-gray-100' : ''}`}>
                <Icon className={`w-8 h-8 mb-2 ${iconColor} transition-transform duration-200 group-hover:scale-110`} />
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                
                {disabled ? (
                    <span className="mt-2 text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{t('comingSoon')}</span>
                ) : (
                    <div className="mt-2 flex items-center text-sm text-gray-500 group-hover:text-gray-800 transition-colors duration-200">
                        <span>{t('viewAll')}</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                )}
            </Link>
            
            <div className="flex-grow p-2 md:p-4">
                <ul className="divide-y divide-gray-200/80">
                    {posts && posts.length > 0 ? (
                        posts.map((post) => (
                             <li key={post.id}>
                                <Link
                                    href={disabled ? '#' : (isExternalLink ? post.link || '#' : `${postBaseHref}/${post.id}`)}
                                    target={isExternalLink && post.link ? '_blank' : '_self'}
                                    rel={isExternalLink && post.link ? 'noopener noreferrer' : ''}
                                    className={`flex justify-between items-center p-3 rounded-md hover:bg-teal-50/50 transition-colors duration-200 ${disabled ? 'pointer-events-none' : ''}`}
                                >
                                    {/* 제목과 NEW 배지를 함께 묶음 */}
                                    <div className="flex items-center min-w-0">
                                        {/* [수정] NEW 배지를 제목 앞으로 이동 */}
                                        {isNewPost(post.created_at) && (
                                            <span className="mr-2 flex-shrink-0 px-2 py-0.5 text-xs font-bold text-white bg-teal-500 rounded-full">
                                                NEW
                                            </span>
                                        )}
                                        <p className="text-md text-gray-800 truncate">{post.title}</p>
                                    </div>
                                    <span className="ml-4 flex-shrink-0 text-sm text-gray-500 font-mono">
                                        {formatDate(post.created_at)}
                                    </span>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-gray-500 h-full flex items-center justify-center">
                            {disabled ? t('servicePreparing') : t('noRecentPosts')}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};


/**
 * 밴쿠버 허브 메인 페이지
 */
export default function VancouverHubPage() {
  const t = useTranslations('van_main');
  const { locale } = useParams() as { locale: string };
  const supabase = createBrowserSupabase();

  const [recentRooms, setRecentRooms] = useState<Post[]>([]);
  const [recentHotDeals, setRecentHotDeals] = useState<Post[]>([]);
  const [recentCommunityPosts, setRecentCommunityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRecentPosts = async () => {
      setLoading(true);
      try {
        const { data: roomsData } = await supabase.from('vancouver_roomlistings').select('id, title, link, event_time').order('event_time', { ascending: false, nullsFirst: false }).limit(5);
        const { data: hotDealsData } = await supabase.from('hot_deal_posts').select('id, title, created_at').order('created_at', { ascending: false }).limit(5);
        const { data: communityData } = await supabase.from('vancouver_community').select('id, title, created_at').order('created_at', { ascending: false }).limit(5);
        
        if (roomsData) setRecentRooms(roomsData.map(p => ({ ...p, created_at: p.event_time || undefined })));
        if (hotDealsData) setRecentHotDeals(hotDealsData);
        if (communityData) setRecentCommunityPosts(communityData);

      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecentPosts();
  }, [supabase]);

  return (
    <div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <section className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                {t('zipplingVancouver')}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                {t('welcome_message')}
                </p>
            </section>
            
            <section className="text-center mb-8">
                <p className="text-xl text-gray-700 font-semibold mb-2">
                    <Compass className="w-6 h-6 inline-block mr-2 text-gray-500" />
                    {t('newcomer_guide_q')}
                </p>
                <Link href="#">
                    <span className="text-base text-teal-600 hover:text-teal-800 hover:underline font-medium transition-colors group inline-flex items-center">
                        {t('newcomer_guide_a')}
                        <ChevronRight className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                </Link>
            </section>
        
            <section className="space-y-5">
                {loading ? (
                <div className="text-center text-gray-500 py-10">
                    <p>{t('loadingPosts')}</p>
                </div>
                ) : (
                <>
                    <BoardPreviewRow 
                        title={t('room_title')}
                        icon={Home}
                        posts={recentRooms}
                        boardHref={`/${locale}/vancouver/room`}
                        postBaseHref=""
                        locale={locale}
                        iconColor="text-teal-500"
                        isExternalLink={true}
                    />
                    <BoardPreviewRow 
                        title={t('hot_deal_title')}
                        icon={Flame}
                        posts={recentHotDeals}
                        boardHref={`/${locale}/hot-deal`}
                        postBaseHref={`/${locale}/hot-deal`}
                        locale={locale}
                        iconColor="text-orange-500"
                    />
                    <BoardPreviewRow 
                        title={t('community_title')}
                        icon={MessageSquare}
                        posts={recentCommunityPosts}
                        boardHref={`/${locale}/vancouver/community`}
                        postBaseHref={`/${locale}/vancouver/community`}
                        locale={locale}
                        iconColor="text-sky-500"
                    />
                    <BoardPreviewRow 
                        title={t('find_job_title')}
                        icon={Briefcase}
                        posts={[]}
                        boardHref="#"
                        postBaseHref="#"
                        locale={locale}
                        iconColor="text-gray-400"
                        disabled={true}
                    />
                </>
                )}
            </section>
        </main>
    </div>
  );
}
