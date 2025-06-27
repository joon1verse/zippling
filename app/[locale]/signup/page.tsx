// app/[locale]/signup/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignUpPage() {
  const t       = useTranslations('signup');
  const { locale } = useParams() as { locale: string };
  const supabase = useSupabaseClient();

  // 폼 상태
  const [fullName, setFullName]   = useState('');
  const [nickname, setNickname]   = useState('');
  const [email, setEmail]         = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string|null>(null);
  const [step, setStep]           = useState<'form'|'checkEmail'>('form');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1) 메타데이터를 localStorage에 임시 저장
    const meta = {
      full_name:     fullName,
      user_nickname: nickname,
      birthdate,
      phone
    };
    window.localStorage.setItem('pending_user_metadata', JSON.stringify(meta));

    // 2) Magic-Link(OTP) 발송
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/signup/callback`;
    console.log('➡️ emailRedirectTo:', redirectTo);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    setLoading(false);
    if (otpError) {
      setError(otpError.message);
    } else {
      setStep('checkEmail');
    }
  };

  // 3) “메일 확인” 단계 UI
  if (step === 'checkEmail') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">{t('checkEmail')}</p>
      </div>
    );
  }

  // 4) 기본 가입 폼
  return (
    <div className="min-h-screen bg-gray-50 pt-2 flex items-start justify-center">
      <div className="w-full px-12 flex justify-center">
        <div className="mt-8 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 헤더 그라데이션 */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
          </div>

          {/* 폼 */}
          <div className="px-8 py-4 space-y-4">
            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                {t('error', { message: error })}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  {t('fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300"
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  {t('nickname')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300"
                />
              </div>

              {/* Birthdate */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  {t('birthdate')}
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={e => setBirthdate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300"
                />
              </div>

              {/* 안내문구 */}
              <p className="text-sm text-gray-500">
                {t('requiredFieldsNote')}
              </p>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition disabled:opacity-50 mt-6 mb-3"
              >
                {loading ? t('sendingLink') : t('signupButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
