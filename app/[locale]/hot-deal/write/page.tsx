/*
================================================================================
  3. 메인 페이지 (수정)
  파일 경로: app/[locale]/hot-deal/write/page.tsx
  (이 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
import { Suspense } from "react";
import { createServerSupabase } from "@server/supabaseServerClient";
import WriteForm from "./write-form.client";
import type { Metadata } from "next";

// SEO 메타데이터 생성 (검색 엔진 제외)
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Write Post',
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Write 페이지 (서버 컴포넌트)
export default async function WritePage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerSupabase();
  const postId = searchParams?.id ? Number(searchParams.id) : null;

  let initialData = null;
  let userRole = null;

  // 서버에서 사용자 정보와 기존 게시글 데이터를 미리 조회
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role;
  }
  
  if (postId && user) {
    const { data: post } = await supabase
      .from('hot_deal_posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    // 본인 또는 관리자만 수정 가능
    if (post && (post.user_id === user.id || userRole === 'admin')) {
      initialData = post;
    }
  }

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <WriteForm locale={locale} initialData={initialData} userRole={userRole} />
    </Suspense>
  );
}
