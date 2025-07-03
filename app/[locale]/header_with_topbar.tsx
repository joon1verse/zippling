/*
 * 파일 1: header_with_topbar.tsx
 * * [수정 사항]
 * - 서버에서 getSession() 대신 getUser()를 사용하여 보안 경고를 해결합니다.
 * - 하위 컴포넌트인 HeaderTopbar에 session 객체 대신 user 객체를 전달합니다.
 */
import { createServerSupabase } from '@server/supabaseServerClient';
import Header from './header';
import HeaderTopbar from './header_topbar';

interface HeaderWithTopbarProps {
  locale: string;
}

export default async function HeaderWithTopbar({ locale }: HeaderWithTopbarProps) {
  const supabase = createServerSupabase();
  
  // [FIXED] getSession() 대신 getUser()를 사용하여 서버에서 안전하게 사용자 정보를 가져옵니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header locale={locale} />
      {/* [FIXED] initialSession 대신 initialUser prop으로 user 객체를 직접 전달합니다. */}
      <HeaderTopbar locale={locale} initialUser={user} />
    </>
  );
}