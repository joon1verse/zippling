'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignUpCallbackPage() {
  const t = useTranslations('signup');
  const { locale } = useParams() as { locale: string };
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // URL에 에러 파라미터가 있으면 error, 없으면 성공으로 간주
    const err = searchParams.get('error');
    if (err) {
      setStatus('error');
      setMessage(err);
    } else {
      setStatus('success');
      setMessage(t('confirmationSuccess'));
    }
  }, [searchParams, t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      {status === 'loading' && (
        <p className="text-gray-700">{t('processing')}</p>
      )}
      {status === 'success' && (
        <p className="text-green-600 text-lg">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-lg">{message}</p>
      )}

      <div className="mt-8 flex space-x-4">
        <Link
          href={`/${locale}/login`}
          className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
        >
          {t('goToLogin')}
        </Link>
        <Link
          href={`/${locale}`}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
