'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignUpPage() {
  const t = useTranslations('signup');
  const { locale } = useParams() as { locale: string };
  const supabase = useSupabaseClient();

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [step,  setStep]      = useState<'form'|'checkEmail'>('form');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPwd) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    // ① Auth 가입 + metadata 저장(나중에 callback 페이지에서 읽음)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/signup/callback`,
        data: { full_name: fullName, user_nickname: nickname, birthdate, phone }
      }
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // ② 인증 메일 확인 단계로 이동
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

          {/* 그라데이션 헤더 */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
          </div>

          {/* 폼 컨테이너 */}
          <div className="px-8 py-4 space-y-4">
            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-base">
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
                  className="w-full pl-4 pr-14 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 transition"
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
                  className="w-full pl-4 pr-14 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 transition"
                />
              </div>

              <p className="text-sm text-gray-500">
                {t('requiredFieldsNote')}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg transition disabled:opacity-50 !mt-6 !mb-3"
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
