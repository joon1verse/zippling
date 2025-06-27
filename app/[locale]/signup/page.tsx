// app/[locale]/signup/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignUpPage() {
  const t         = useTranslations('signup');
  const { locale }= useParams() as { locale: string };
  const supabase  = useSupabaseClient();

  const [fullName, setFullName]       = useState('');
  const [nickname, setNickname]       = useState('');
  const [email, setEmail]             = useState('');
  const [birthdate, setBirthdate]     = useState('');
  const [phone, setPhone]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string|null>(null);
  const [step, setStep]               = useState<'form'|'checkEmail'>('form');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPwd) {
      setError(t('passwordMismatch'));
      return;
    }
    setLoading(true);

    // ✔︎ 이메일 인증 후 callback 페이지로
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/signup/callback`;
    console.log('➡️ emailRedirectTo:', redirectTo);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name:     fullName,
          user_nickname: nickname,
          birthdate,
          phone
        }
      }
    });
    console.log('signUpError ▶', signUpError);

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setStep('checkEmail');
    }
  };

  if (step === 'checkEmail') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">{t('checkEmail')}</p>
      </div>
    );
  }

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
                {error}
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
                  className="w-full pl-4 pr-14 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 transition"
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
                  className="w-full pl-4 pr-14 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 transition"
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
                  className="w-full pl-4 pr-14 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 transition"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 transition"
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
                  className="w-full pl-4 pr-14 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  {t('password')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300"
                />
              </div>
              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  {t('confirmPassword')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg mt-6 mb-3"
              >
                {loading ? t('signingUp') : t('signupButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}