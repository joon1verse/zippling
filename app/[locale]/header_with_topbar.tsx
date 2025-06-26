// Server Component: SSR에서 세션을 받아와 초기 props로 넘겨줍니다.
import { createServerSupabase } from '@server/supabaseServerClient';
import Header from './header';                  // 기존 메인 헤더
import HeaderTopbar from './header_topbar';    // 방금 만든 서브헤더

interface HeaderWithTopbarProps {
  locale: string;
}

export default async function HeaderWithTopbar({ locale }: HeaderWithTopbarProps) {
  const supabase = createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <>
      {/* ① 메인 헤더 먼저 렌더링 */}
      <Header locale={locale} />

      {/* ② 그 아래에 서브헤더 */}
      <HeaderTopbar locale={locale} initialSession={session} />
    </>
  );
}
