import Header from './header';
import HeaderTopbar from './header_topbar';
// [수정] 새로 만든 서버 클라이언트를 import 합니다.
import { createCacheFirstSupabaseServer } from '@server/supabaseCacheServer';

interface HeaderWithTopbarProps {
  locale: string;
}

export default async function HeaderWithTopbar({ locale }: HeaderWithTopbarProps) {
  const supabase = createCacheFirstSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('user_nickname')
      .eq('id', user.id)
      .single();
    profile = profileData;
  }

  return (
    <>
      <Header locale={locale} />
      <HeaderTopbar
        locale={locale}
        initialUser={user}
        initialProfile={profile}
      />
    </>
  );
}