// app/[locale]/vancouver/community/write/WriteForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { extractFirstImageSrc } from '../../../../../utilities/extractFirstImage';
import { useTranslations } from 'next-intl';
import { Megaphone } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WriteForm() {
  const { locale } = useParams() as { locale: string };
  const t = useTranslations('community.write');
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const idParam = searchParams.get('id');
  const isEdit = Boolean(idParam);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isNotice, setIsNotice] = useState(false); // 공지 여부 상태 추가
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // 사용자 역할 상태 추가

  // 1. 사용자 역할(role) 확인
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || 'user');
      }
    };
    checkUserRole();
  }, [supabase]);

  // 2. 수정 모드일 경우, 기존 데이터 불러오기
  useEffect(() => {
    if (!isEdit) return;
    const fetchPostData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vancouver_community')
        .select('title, content, is_notice') // is_notice도 함께 불러옵니다.
        .eq('id', Number(idParam))
        .single();
      if (data && !error) {
        setTitle(data.title);
        setContent(data.content);
        setIsNotice(data.is_notice || false); // 불러온 공지 상태를 설정합니다.
      }
      setLoading(false);
    };
    fetchPostData();
  }, [isEdit, idParam, supabase]);

  // 3. 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError(t('titleContentRequired'));
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(t('loginRequired'));
      setLoading(false);
      return;
    }
    
    const { data: profile } = await supabase.from('user_profiles').select('user_nickname').eq('id', user.id).single();
    if (!profile?.user_nickname) {
      setError(t('nicknameRequired'));
      setLoading(false);
      return;
    }

    const autoThumb = extractFirstImageSrc(content);

    // is_notice를 payload에 포함
    const payload = {
      title: title.trim(),
      content,
      thumbnail_url: autoThumb || null,
      user_id: user.id,
      user_nickname: profile.user_nickname,
      is_notice: userRole === 'admin' ? isNotice : false, // 관리자일 때만 isNotice 값을 사용
    };

    let dbError: any = null;
    if (isEdit) {
      const { error } = await supabase.from('vancouver_community').update(payload).eq('id', Number(idParam));
      dbError = error;
    } else {
      const { error } = await supabase.from('vancouver_community').insert([payload]);
      dbError = error;
    }

    if (dbError) {
      setError(`${t('errorPrefix')} ${dbError.message}`);
    } else {
      router.push(`/${locale}/vancouver/community`);
    }
    setLoading(false);
  };

  const modules = { toolbar: [ [{ header: [1, 2, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean'], ], };
  const formats = [ 'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image' ];

  return (
    // [수정됨] 이 컴포넌트의 최상위 div를 main으로 변경하여 시맨틱 의미를 강화합니다.
    <main className="pt-4 px-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-8">{isEdit ? t('editPost') : t('writePost')}</h1>
      {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">{t('titleLabel')}</label>
          <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 text-lg focus:ring-teal-500 focus:border-teal-500" disabled={loading} />
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-gray-700">{t('contentLabel')}</label>
          <div className="bg-white border border-gray-300 rounded-md">
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} formats={formats} placeholder={t('contentPlaceholder')} className="text-base [&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[220px]" />
          </div>
           <p className="text-sm text-gray-500 mt-2">{t('thumbnailHelp')}</p>
        </div>

        {/* 4. 관리자에게만 보이는 공지 체크박스 */}
        {userRole === 'admin' && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              id="is_notice"
              checked={isNotice}
              onChange={(e) => setIsNotice(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="is_notice" className="font-medium text-yellow-800 flex items-center gap-2 cursor-pointer">
              <Megaphone size={16} />
              Make it as a notice.
            </label>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg hover:bg-teal-700 disabled:opacity-50 font-bold tracking-wide transition-colors">
          {loading ? t('saving') : isEdit ? t('update') : t('save')}
        </button>
      </form>
    </main>
  );
}
