import { createServerSupabase } from '@server/supabaseServerClient';
import Header from './header';
import HeaderTopbar from './header_topbar';
import type { Session } from '@supabase/supabase-js';

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
      <Header locale={locale} />
      <HeaderTopbar locale={locale} initialSession={session} />
    </>
  );
}
