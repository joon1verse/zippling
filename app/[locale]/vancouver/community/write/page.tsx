// app/[locale]/vancouver/community/write/page.tsx

import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@server/supabaseServerClient';
import WriteForm from './write-form.client';
import type { Metadata } from 'next';
import type { Database } from '@server/types';

type CommunityPost = Database['public']['Tables']['vancouver_community']['Row'];

type Props = {
  params: { locale: string };
  searchParams: { [key:string]: string | string[] | undefined };
};

// 글쓰기/수정 페이지는 검색 엔진에 노출될 필요가 없으므로 noindex 처리합니다.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Write Post',
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Suspense의 fallback UI
function FormLoading() {
  return <div className="p-8 text-center">Loading form...</div>;
}

// 글쓰기/수정 페이지의 메인 서버 컴포넌트
async function WritePageContent({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  const supabase = createServerSupabase();

  const postId = searchParams?.id ? Number(searchParams.id) : null;
  // [수정] 변수명을 post에서 initialData로 변경하여 hot-deal 예시와 통일합니다.
  let initialData: CommunityPost | null = null;
  let userRole: string = 'user';

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role || 'user';
  }

  if (postId && user) {
    const { data: fetchedPost } = await supabase
      .from('vancouver_community')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (fetchedPost && (fetchedPost.user_id === user.id || userRole === 'admin')) {
      initialData = fetchedPost;
    }
  }

  const t = await getTranslations('vancouver.CommunityPage.WritePage');
  const translations = {
    editPost: t('editPost'),
    writePost: t('writePost'),
    titleLabel: t('titleLabel'),
    contentLabel: t('contentLabel'),
    contentPlaceholder: t('contentPlaceholder'),
    thumbnailHelp: t('thumbnailHelp'),
    saving: t('saving'),
    update: t('update'),
    save: t('save'),
  };

  return (
    <WriteForm
      // [수정] 속성명을 post에서 initialData로 변경합니다.
      initialData={initialData}
      userRole={userRole}
      translations={translations}
    />
  );
}

// 최종 페이지 export (Suspense로 감싸서 searchParams 사용을 지원)
export default function Page(props: Props) {
  return (
    <Suspense fallback={<FormLoading />}>
      <WritePageContent {...props} />
    </Suspense>
  );
}
