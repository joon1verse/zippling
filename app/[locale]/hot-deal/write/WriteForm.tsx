// app/[locale]/hot-deal/write/WriteForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { extractFirstImageSrc } from '../../../../utilities/extractFirstImage';
import { useTranslations } from 'next-intl';
import { Megaphone } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WriteForm() {
  const { locale } = useParams() as { locale: string };
  const t = useTranslations('hotdeal.write');
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const idParam = searchParams.get('id');
  const isEdit = Boolean(idParam);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // [수정 1] price 상태의 타입을 string으로 변경하여 소수점 입력을 원활하게 처리합니다.
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('CA$');
  const [isNotice, setIsNotice] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // 1. 사용자 역할(role) 확인
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
        setUserRole(profile?.role || 'user');
      }
    };
    checkUserRole();
  }, [supabase]);

  // 2. 수정 모드 데이터 불러오기
  useEffect(() => {
    if (!isEdit) return;
    const fetchPostData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hot_deal_posts')
        .select('title, content, price, currency_type, is_notice')
        .eq('id', Number(idParam))
        .single();
      if (data && !error) {
        setTitle(data.title);
        setContent(data.content);
        // [수정 2] 불러온 숫자 가격을 문자열로 변환하여 상태에 저장합니다.
        setPrice(data.price ? String(data.price) : '');
        setCurrency(data.currency_type ?? 'CA$');
        setIsNotice(data.is_notice || false);
      }
      setLoading(false);
    };
    fetchPostData();
  }, [isEdit, idParam, supabase]);

  // [수정 3] 가격 입력 변경을 처리하는 핸들러 함수 추가
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // 숫자, 그리고 소수점 둘째 자리까지만 허용하는 정규식
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === '' || regex.test(value)) {
      setPrice(value);
    }
  };

  // 3. 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // [수정 4] 유효성 검사 시, 문자열인 price를 숫자로 변환(parseFloat)하여 비교합니다.
    if (!title.trim() || !content.trim() || !price || parseFloat(price) <= 0) {
      setError(t('titleContentPriceRequired'));
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

    const payload = {
      title: title.trim(),
      content,
      thumbnail_url: autoThumb,
      // [수정 5] 데이터베이스에 저장하기 전, 문자열 가격을 숫자로 변환합니다.
      price: parseFloat(price),
      currency_type: currency,
      user_nickname: profile.user_nickname,
      user_id: user.id,
      is_notice: userRole === 'admin' ? isNotice : false,
    };

    let dbError: any = null;
    if (isEdit) {
      const { error } = await supabase.from('hot_deal_posts').update(payload).eq('id', Number(idParam));
      dbError = error;
    } else {
      const { error } = await supabase.from('hot_deal_posts').insert([payload]);
      dbError = error;
    }

    if (dbError) {
      setError(`${t('errorPrefix')} ${dbError.message}`);
    } else {
      router.push(`/${locale}/hot-deal`);
    }
    setLoading(false);
  };

  const modules = { toolbar: [ [{ header: [1, 2, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean'], ], };
  const formats = [ 'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image' ];

  return (
    <main className="pt-4 px-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-8 pt-6">{isEdit ? t('editHotDeal') : t('writeHotDeal')}</h1>
      {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">{t('titleLabel')}</label>
          <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 text-lg focus:ring-teal-500 focus:border-teal-500" disabled={loading} />
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-gray-700">{t('priceLabel')}</label>
          <div className="flex gap-3">
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="border-gray-300 rounded-md shadow-sm px-3 py-2 text-base min-w-[100px] focus:ring-teal-500 focus:border-teal-500" disabled={loading}>
              <option value="CA$">CA$</option>
              <option value="US$">US$</option>
              <option value="JPY">JPY</option>
              <option value="KRW">KRW</option>
            </select>
            {/* [수정 6] 가격 input의 타입을 'text'로 변경하고, inputMode를 'decimal'로 설정하며, 새로운 onChange 핸들러를 연결합니다. */}
            <input 
              type="text"
              inputMode="decimal"
              value={price}
              onChange={handlePriceChange}
              className="w-full border-gray-300 rounded-md shadow-sm px-4 py-3 text-base focus:ring-teal-500 focus:border-teal-500" 
              placeholder={t('amountPlaceholder')} 
              disabled={loading} 
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">{t('contentLabel')}</label>
          <div className="bg-white border border-gray-300 rounded-md">
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} formats={formats} placeholder={t('contentPlaceholder')} className="text-base [&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[220px]" />
          </div>
        </div>
        
        {userRole === 'admin' && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input type="checkbox" id="is_notice" checked={isNotice} onChange={(e) => setIsNotice(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
            <label htmlFor="is_notice" className="font-medium text-yellow-800 flex items-center gap-2 cursor-pointer"><Megaphone size={16} />Make it as a notice</label>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg hover:bg-teal-700 disabled:opacity-50 font-bold tracking-wide transition-colors">
          {loading ? t('saving') : isEdit ? t('update') : t('save')}
        </button>
      </form>
    </main>
  );
}
