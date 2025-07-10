/*
================================================================================
  2. 클라이언트 컴포넌트 (신규 생성 또는 WriteForm.tsx 수정)
  파일 경로: app/[locale]/hot-deal/write/write-form.client.tsx
================================================================================
*/
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Megaphone } from 'lucide-react';
import { upsertPostAction } from './actions';
import type { Database } from '@server/types';

// ReactQuill은 클라이언트에서만 렌더링
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
type HotDealPost = Database['public']['Tables']['hot_deal_posts']['Row'];

interface WriteFormProps {
  locale: string;
  initialData?: HotDealPost | null;
  userRole?: string | null;
}

// 폼 제출 버튼 컴포넌트
function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations('HotDealPage.write');
  
  return (
    <button type="submit" disabled={pending} className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg hover:bg-teal-700 disabled:opacity-50 font-bold tracking-wide transition-colors">
      {pending ? t('saving') : isEdit ? t('update') : t('save')}
    </button>
  );
}

export default function WriteForm({ locale, initialData, userRole }: WriteFormProps) {
  const t = useTranslations('HotDealPage.write');
  const isEdit = Boolean(initialData?.id);

  const [content, setContent] = useState('');
  
  // 서버 액션과 폼 상태 연결
  const [state, formAction] = useFormState(upsertPostAction, { message: null });

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (initialData?.content) {
      setContent(initialData.content);
    }
  }, [initialData]);

  const modules = { toolbar: [ [{ header: [1, 2, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean'], ], };
  const formats = [ 'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image' ];

  return (
    <main className="pt-4 px-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-8 pt-6">{isEdit ? t('editHotDeal') : t('writeHotDeal')}</h1>
      
      <form action={formAction} className="space-y-6">
        {/* 서버 액션 결과 메시지 표시 */}
        {state?.message && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{state.message}</div>}

        {/* 서버 액션에 필요한 숨겨진 필드 */}
        <input type="hidden" name="id" value={initialData?.id || ''} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="content" value={content} />

        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">{t('titleLabel')}</label>
          <input id="title" name="title" type="text" defaultValue={initialData?.title} required className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 text-lg focus:ring-teal-500 focus:border-teal-500" />
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-gray-700">{t('priceLabel')}</label>
          <div className="flex gap-3">
            <select name="currency_type" defaultValue={initialData?.currency_type || 'CA$'} className="border-gray-300 rounded-md shadow-sm px-3 py-2 text-base min-w-[100px] focus:ring-teal-500 focus:border-teal-500">
              <option value="CA$">CA$</option>
              <option value="US$">US$</option>
              <option value="JPY">JPY</option>
              <option value="KRW">KRW</option>
            </select>
            <input 
              type="text"
              name="price"
              inputMode="decimal"
              defaultValue={initialData?.price || ''}
              pattern="^\d*\.?\d{0,2}$"
              className="w-full border-gray-300 rounded-md shadow-sm px-4 py-3 text-base focus:ring-teal-500 focus:border-teal-500" 
              placeholder={t('amountPlaceholder')} 
              required
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
            <input type="checkbox" id="is_notice" name="is_notice" defaultChecked={initialData?.is_notice || false} className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
            <label htmlFor="is_notice" className="font-medium text-yellow-800 flex items-center gap-2 cursor-pointer"><Megaphone size={16} />Make it as a notice</label>
          </div>
        )}

        <SubmitButton isEdit={isEdit} />
      </form>
    </main>
  );
}