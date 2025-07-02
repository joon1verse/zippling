// app/[locale]/vancouver/community/write/WriteForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { extractFirstImageSrc } from '../../../../../utilities/extractFirstImage';
import { useTranslations } from 'next-intl';

// ReactQuill을 동적으로 임포트하여 SSR 문제를 방지합니다.
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WriteForm() {
  const { locale } = useParams() as { locale: string };
  // 번역 네임스페이스를 'community.write'로 변경합니다.
  const t = useTranslations('community.write');
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const idParam = searchParams.get('id');
  const isEdit = Boolean(idParam);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 수정 모드일 경우, 기존 게시물 데이터를 불러옵니다.
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vancouver_community') // vancouver_community 테이블 사용
        .select('title, content') // 제목과 내용만 선택
        .eq('id', Number(idParam))
        .single();
      if (data && !error) {
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    })();
  }, [isEdit, idParam, supabase]);

  // 폼 제출 핸들러
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
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_nickname')
      .eq('id', user.id)
      .single();

    if (!profile?.user_nickname) {
      setError(t('nicknameRequired'));
      setLoading(false);
      return;
    }

    // 내용에서 첫 번째 이미지를 자동으로 추출하여 썸네일로 사용합니다.
    const autoThumb = extractFirstImageSrc(content);

    const payload = {
      title: title.trim(),
      content,
      thumbnail_url: autoThumb || null,
      user_id: user.id,
      user_nickname: profile.user_nickname,
    };

    let dbError: any = null;
    if (isEdit) {
      const { error } = await supabase
        .from('vancouver_community')
        .update({
          title: payload.title,
          content: payload.content,
          thumbnail_url: payload.thumbnail_url,
        })
        .eq('id', Number(idParam));
      dbError = error;
    } else {
      const { error } = await supabase
        .from('vancouver_community')
        .insert([payload]);
      dbError = error;
    }

    if (dbError) {
      setError(`${t('errorPrefix')} ${dbError.message}`);
    } else {
      // 성공 시 커뮤니티 목록 페이지로 리디렉션합니다.
      router.push(`/${locale}/vancouver/community`);
    }
    setLoading(false);
  };

  // ReactQuill 에디터 설정
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };
  const formats = [ 'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image' ];

  return (
    <div className="pt-4 px-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? t('editPost') : t('writePost')}
      </h1>
      {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">{t('titleLabel')}</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 text-lg focus:ring-teal-500 focus:border-teal-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-gray-700">{t('contentLabel')}</label>
          <div className="bg-white border border-gray-300 rounded-md">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder={t('contentPlaceholder')}
              className="text-base [&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[220px]"
            />
          </div>
           <p className="text-sm text-gray-500 mt-2">{t('thumbnailHelp')}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg hover:bg-teal-700 disabled:opacity-50 font-bold tracking-wide transition-colors"
        >
          {loading ? t('saving') : isEdit ? t('update') : t('save')}
        </button>
      </form>
    </div>
  );
}
