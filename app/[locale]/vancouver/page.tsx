// app/[locale]/vancouver/page.tsx
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerSupabase } from '@server/supabaseServerClient'; // [Refactoring Point] 서버 클라이언트로 변경
import { Home, Briefcase, MessageSquare, Flame, Compass, ChevronRight } from 'lucide-react';

// [Refactoring Point] SEO 최적화를 위한 generateMetadata 함수 추가
type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'vancouver' });

  return {
    title: t('LandingPage.meta.title'),
    description: t('LandingPage.meta.description'),
    openGraph: {
      title: t('LandingPage.meta.openGraph.title'),
      description: t('LandingPage.meta.openGraph.description'),
      images: [
        {
          url: t('LandingPage.meta.openGraph.imageUrl'),
          width: 1200,
          height: 630,
          alt: t('LandingPage.meta.openGraph.title'),
        },
      ],
      locale: locale,
      type: 'website',
    },
  };
}

// 공용 Post 타입 정의 (기존과 동일)
type Post = {
  id: number | string;
  title: string;
  created_at?: string;
  link?: string;
};

// [Refactoring Point] BoardPreviewRow 컴포넌트 리팩토링
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
  // 번역(t) 함수 대신 필요한 텍스트를 직접 props로 전달받음
  comingSoonText: string;
  viewAllText: string;
  servicePreparingText: string;
  noRecentPostsText: string;
}

const BoardPreviewRow: React.FC<BoardPreviewRowProps> = ({ 
    title, posts, boardHref, postBaseHref, locale, icon: Icon, iconColor, 
    isExternalLink = false, disabled = false,
    comingSoonText, viewAllText, servicePreparingText, noRecentPostsText 
}) => {
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { month: '2-digit', day: '2-digit' });
    };

    const isNewPost = (dateString?: string) => {
        if (!dateString) return false;
        const postDate = new Date(dateString);
        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        return (now.getTime() - postDate.getTime()) < oneDayInMs;
    };

    return (
        <div className={`flex flex-col md:flex-row bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden ${disabled ? 'opacity-60' : ''}`}>
            <Link href={disabled ? '#' : boardHref} className={`group md:w-52 flex-shrink-0 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-200/80 bg-gray-100 transition-colors duration-200 hover:bg-teal-100/30 ${disabled ? 'cursor-not-allowed bg-gray-100 hover:bg-gray-100' : ''}`}>
                <Icon className={`w-8 h-8 mb-2 ${iconColor} transition-transform duration-200 group-hover:scale-110`} />
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                
                {disabled ? (
                    <span className="mt-2 text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{comingSoonText}</span>
                ) : (
                    <div className="mt-2 flex items-center text-sm text-gray-500 group-hover:text-gray-800 transition-colors duration-200">
                        <span>{viewAllText}</span>
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
                                    <div className="flex items-center min-w-0">
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
                            {disabled ? servicePreparingText : noRecentPostsText}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};


// [Refactoring Point] 서버 컴포넌트로 전환
export default async function VancouverHubPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('vancouver');
  const supabase = createServerSupabase();

  // [Refactoring Point] 서버 사이드에서 데이터 직접 페칭 (Promise.all로 병렬 처리)
  const [roomsResult, hotDealsResult, communityResult] = await Promise.all([
    supabase.from('vancouver_roomlistings').select('id, title, link, event_time').order('event_time', { ascending: false, nullsFirst: false }).limit(5),
    supabase.from('hot_deal_posts').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('vancouver_community').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
  ]);

  const recentRooms: Post[] = roomsResult.data?.map(p => ({ ...p, created_at: p.event_time || undefined })) || [];
  const recentHotDeals: Post[] = hotDealsResult.data || [];
  const recentCommunityPosts: Post[] = communityResult.data || [];

  return (
    <div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <section className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                    {/* [Refactoring Point] vancouver.json 구조에 맞게 번역 키 수정 */}
                    {t('LandingPage.heroTitle')}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    {t('LandingPage.heroDescription')}
                </p>
            </section>
            
            <section className="text-center mb-8">
                <p className="text-xl text-gray-700 font-semibold mb-2">
                    <Compass className="w-6 h-6 inline-block mr-2 text-gray-500" />
                    {t('LandingPage.newcomerGuide.title')}
                </p>
                <Link href={`/${locale}/vancouver/guides`}>
                    <span className="text-base text-teal-600 hover:text-teal-800 hover:underline font-medium transition-colors group inline-flex items-center">
                        {t('LandingPage.newcomerGuide.linkText')}
                        <ChevronRight className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                </Link>
            </section>
        
            <section className="space-y-5">
                {/* [Refactoring Point] 로딩 상태 제거. 데이터는 서버에서 이미 모두 준비됨 */}
                <BoardPreviewRow 
                    title={t('LandingPage.sections.room_title')}
                    icon={Home}
                    posts={recentRooms}
                    boardHref={`/${locale}/vancouver/room`}
                    postBaseHref=""
                    locale={locale}
                    iconColor="text-teal-500"
                    isExternalLink={true}
                    comingSoonText={t('LandingPage.sections.comingSoon')}
                    viewAllText={t('LandingPage.sections.viewAll')}
                    servicePreparingText={t('LandingPage.sections.servicePreparing')}
                    noRecentPostsText={t('LandingPage.sections.noRecentPosts')}
                />
                <BoardPreviewRow 
                    title={t('LandingPage.sections.hot_deal_title')}
                    icon={Flame}
                    posts={recentHotDeals}
                    boardHref={`/${locale}/hot-deal`}
                    postBaseHref={`/${locale}/hot-deal`}
                    locale={locale}
                    iconColor="text-orange-500"
                    comingSoonText={t('LandingPage.sections.comingSoon')}
                    viewAllText={t('LandingPage.sections.viewAll')}
                    servicePreparingText={t('LandingPage.sections.servicePreparing')}
                    noRecentPostsText={t('LandingPage.sections.noRecentPosts')}
                />
                <BoardPreviewRow 
                    title={t('LandingPage.sections.community_title')}
                    icon={MessageSquare}
                    posts={recentCommunityPosts}
                    boardHref={`/${locale}/vancouver/community`}
                    postBaseHref={`/${locale}/vancouver/community`}
                    locale={locale}
                    iconColor="text-sky-500"
                    comingSoonText={t('LandingPage.sections.comingSoon')}
                    viewAllText={t('LandingPage.sections.viewAll')}
                    servicePreparingText={t('LandingPage.sections.servicePreparing')}
                    noRecentPostsText={t('LandingPage.sections.noRecentPosts')}
                />
                <BoardPreviewRow 
                    title={t('LandingPage.sections.find_job_title')}
                    icon={Briefcase}
                    posts={[]}
                    boardHref="#"
                    postBaseHref="#"
                    locale={locale}
                    iconColor="text-gray-400"
                    disabled={true}
                    comingSoonText={t('LandingPage.sections.comingSoon')}
                    viewAllText={t('LandingPage.sections.viewAll')}
                    servicePreparingText={t('LandingPage.sections.servicePreparing')}
                    noRecentPostsText={t('LandingPage.sections.noRecentPosts')}
                />
            </section>
        </main>
    </div>
  );
}