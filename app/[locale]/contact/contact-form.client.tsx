/*
================================================================================
  2. 클라이언트 컴포넌트 (신규 생성)
  파일 경로: app/[locale]/contact/contact-form.client.tsx
  (이 파일을 새로 생성해주세요.)
================================================================================
*/
'use client';

import { useState, useTransition } from 'react';
import { sendContactEmail } from './actions'; // 방금 만든 서버 액션을 import 합니다.

// 폼에 필요한 번역 텍스트를 props로 받기 위한 타입 정의
type FormTranslations = {
  formHeading: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  successMessage: string;
};

export default function ContactForm({ t }: { t: FormTranslations }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ success?: boolean; message: string } | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await sendContactEmail(formData);
      if (result.success) {
        setStatus({ success: true, message: t.successMessage });
        form.reset();
      } else {
        setStatus({ success: false, message: `Error: ${result.error}` });
      }
    });
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {t.formHeading}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder={t.namePlaceholder}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          required
        />
        <input
          type="email"
          name="email"
          placeholder={t.emailPlaceholder}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          required
        />
        <textarea
          name="message"
          placeholder={t.messagePlaceholder}
          className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          required
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isPending}
            className="bg-teal-600 text-white rounded-md px-5 py-2 font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? t.submitting : t.submit}
          </button>
          {status && (
            <p className={`text-sm ${status.success ? 'text-green-600' : 'text-red-600'}`}>
              {status.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}