'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { extractFirstImageSrc } from '../../../../utilities/extractFirstImage';
// 1. useTranslations 훅을 가져옵니다.
import { useTranslations } from 'next-intl';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WriteForm() {
  const { locale } = useParams() as { locale: string };
  // 2. 'hotdeal.write' 네임스페이스를 사용하도록 설정합니다.
  const t = useTranslations('hotdeal.write');
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const idParam = searchParams.get('id');
  const isEdit = Boolean(idParam);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('CA$');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hot_deal_posts')
        .select('title, content, thumbnail_url, price, currency_type')
        .eq('id', Number(idParam))
        .single();
      if (data && !error) {
        setTitle(data.title);
        setContent(data.content);
        setThumbnailUrl(data.thumbnail_url ?? '');
        setPrice(data.price);
        setCurrency(data.currency_type);
      }
      setLoading(false);
    })();
  }, [isEdit, idParam, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || price <= 0) {
      setError('Title, content, and price are required.'); // 하드코딩된 에러는 그대로 두거나 별도의 번역 키를 사용할 수 있습니다.
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Login is required.');
      setLoading(false);
      return;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_nickname')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.user_nickname) {
      setError('Nickname is not registered in your profile.');
      setLoading(false);
      return;
    }

    const autoThumb = extractFirstImageSrc(content);

    const payload = {
      title: title.trim(),
      content,
      thumbnail_url: thumbnailUrl || autoThumb || null,
      price,
      currency_type: currency,
      user_nickname: profile.user_nickname,
    };

    let dbError: any = null;
    if (isEdit) {
      const { error } = await supabase
        .from('hot_deal_posts')
        .update(payload)
        .eq('id', Number(idParam));
      dbError = error;
    } else {
      const { error } = await supabase
        .from('hot_deal_posts')
        .insert([payload]);
      dbError = error;
    }

    if (dbError) setError(`${t('errorPrefix')} ${dbError.message}`);
    else router.push(`/${locale}/hot-deal`);
    setLoading(false);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
  ];

  return (
    <div className="pt-4 px-4 max-w-4xl mx-auto">
      {/* 3. 모든 하드코딩된 텍스트를 t()로 교체합니다. */}
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? t('editHotDeal') : t('writeHotDeal')}
      </h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 font-medium">{t('titleLabel')}</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border rounded px-4 py-2 text-lg"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Price</label>
          <div className="flex gap-3">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="border rounded px-3 py-2 text-base min-w-[100px]"
            >
              <option value="CA$">CA$</option>
              <option value="US$">US$</option>
              <option value="JPY">JPY</option>
              <option value="KRW">KRW</option>
            </select>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              min={0}
              className="w-full border rounded px-4 py-3 text-base"
              placeholder="Amount"
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">{t('contentLabel')}</label>
          <div className="bg-white border rounded">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Write your deal details here..."
              className="text-base [&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[220px] min-w-fit"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">{t('thumbnailUrlLabel')}</label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            className="w-full border rounded px-4 py-2"
            disabled={loading}
            placeholder={t('thumbnailUrlPlaceholder')}
          />
           <p className="text-sm text-gray-500 mt-1">{t('thumbnailUrlHelp')}</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg hover:bg-teal-700 disabled:opacity-50 font-bold tracking-wide"
        >
          {loading
            ? t('saving')
            : isEdit ? t('update') : t('save')}
        </button>
      </form>
    </div>
  );
}
