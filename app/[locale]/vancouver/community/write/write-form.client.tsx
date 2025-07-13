// app/[locale]/vancouver/community/write/write-form.client.tsx
'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { saveCommunityPost, FormState } from './actions';
import { Megaphone } from 'lucide-react';
import type { Database } from '@server/types';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type CommunityPost = Database['public']['Tables']['vancouver_community']['Row'];

interface WriteFormProps {
  // [수정] 속성명을 post에서 initialData로 변경합니다.
  initialData: CommunityPost | null;
  userRole: string;
  translations: {
    editPost: string;
    writePost: string;
    titleLabel: string;
    contentLabel: string;
    contentPlaceholder: string;
    thumbnailHelp: string;
    saving: string;
    update: string;
    save: string;
  };
}

function SubmitButton({ isEdit, translations }: { isEdit: boolean; translations: WriteFormProps['translations'] }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg hover:bg-teal-700 disabled:opacity-50 font-bold tracking-wide transition-colors">
      {pending ? translations.saving : isEdit ? translations.update : translations.save}
    </button>
  );
}

export default function WriteForm({ initialData, userRole, translations }: WriteFormProps) {
  // [수정] post 대신 initialData를 사용합니다.
  const isEdit = initialData !== null;
  const initialState: FormState = { message: '' };
  const [formState, formAction] = useFormState(saveCommunityPost, initialState);
  
  const [content, setContent] = useState(initialData?.content || '');

  const modules = { toolbar: [ [{ header: [1, 2, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean'], ], };
  const formats = [ 'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image' ];

  return (
    <main className="pt-6 px-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-8">{isEdit ? translations.editPost : translations.writePost}</h1>
      
      {formState.message === 'error' && formState.errors?.general && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">
          {formState.errors.general.join(', ')}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="postId" value={initialData.id} />}
        
        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">{translations.titleLabel}</label>
          <input 
            id="title" 
            name="title" 
            type="text" 
            defaultValue={initialData?.title || ''} 
            required 
            className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 text-lg focus:ring-teal-500 focus:border-teal-500" 
          />
          {formState.errors?.title && <p className="text-red-500 text-sm mt-1">{formState.errors.title.join(', ')}</p>}
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-gray-700">{translations.contentLabel}</label>
          <input type="hidden" name="content" value={content} />
          <div className="bg-white border border-gray-300 rounded-md">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules} 
              formats={formats} 
              placeholder={translations.contentPlaceholder} 
              className="text-base [&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[220px]" 
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{translations.thumbnailHelp}</p>
          {formState.errors?.content && <p className="text-red-500 text-sm mt-1">{formState.errors.content.join(', ')}</p>}
        </div>

        {userRole === 'admin' && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              id="isNotice"
              name="isNotice"
              defaultChecked={initialData?.is_notice || false}
              className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="isNotice" className="font-medium text-yellow-800 flex items-center gap-2 cursor-pointer">
              <Megaphone size={16} />
              Make it as a notice.
            </label>
          </div>
        )}

        <SubmitButton isEdit={isEdit} translations={translations} />
      </form>
    </main>
  );
}
