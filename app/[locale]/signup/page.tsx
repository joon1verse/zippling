// app/[locale]/signup/page.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { useParams }       from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignUpPage() {
  const t         = useTranslations('signup');
  const { locale }= useParams<{ locale: string }>();
  const supabase  = useSupabaseClient();

  // form state
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [fullName,   setFullName]   = useState('');
  const [nickname,   setNickname]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [birthdate,  setBirthdate]  = useState('');

  // 비밀번호 강도
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const [passwordValid, setPasswordValid] = useState(true);

  // 한글 검증: 자음·모음(ㄱ-ㅎ,ㅏ-ㅣ) 있으면 false
  const hasJamo = (s: string) => /[ㄱ-ㅎㅏ-ㅣ]/.test(s);
    const hasBadChar = (s: string) =>
    /[^\p{L}\p{N}\-_]/u.test(s);

  // 필수 항목 모두 채워졌는지
  const allRequiredFilled = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      confirmPwd.trim().length > 0 &&
      fullName.trim().length > 0 &&
      nickname.trim().length > 0
    );
  }, [email, password, confirmPwd, fullName, nickname]);

    // 이름 에러 메시지
  const nameError = useMemo(() => {
    if (!fullName) return '';
    if (hasJamo(fullName)) return t('nameHangulError');
    if (hasBadChar(fullName)) return t('nameSpecialError');
    return '';
  }, [fullName]);

  // 닉네임 에러 메시지
  const nickError = useMemo(() => {
    if (!nickname) return '';
    if (hasJamo(nickname)) return t('nickHangulError');
    if (/^[가-힣]+$/.test(nickname) && nickname.length < 2) return t('nickLenError');
    if (hasBadChar(nickname)) return t('nickSpecialError');
    return '';
  }, [nickname]);

  // 4) 필수 입력 + 비밀번호 검사 + 에러 없음
    const isFormValid = useMemo(() => {
    return (
      email &&
      password &&
      confirmPwd &&
      fullName &&
      nickname &&
      PASSWORD_REGEX.test(password) &&
      password === confirmPwd &&
      !nameError &&
      !nickError
      
    );
  }, [email, password, confirmPwd, fullName, nickname, phone, nameError, nickError]);
  const confirmPasswordError = useMemo(() => {
  if (confirmPwd && confirmPwd !== password) {
    return t('passwordMismatchError');
  }
  return '';
  }, [password, confirmPwd]);

  const [step, setStep]       = useState<'form'|'checkEmail'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 강도·일치 재검증
    if (!PASSWORD_REGEX.test(password)) {
      return setError(t('passwordStrength'));
    }
    if (password !== confirmPwd) {
      return setError(t('passwordMismatch'));
    }
    if (nameError) return setError(nameError);
    if (nickError) return setError(nickError);

    setLoading(true);

    // (B방식) 서버 검증 API 생략 — 바로 클라이언트 SDK 호출
    const redirectTo = `${window.location.origin}/${locale}/signup/callback`;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name:     fullName,
          user_nickname: nickname,
          phone,
          birthdate,
        }
      }
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setStep('checkEmail');
    }
  };

  // 2단계: 이메일 확인 텍스트
if (step === 'checkEmail') {
  return (
    <div className="pt-12 px-4 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-600 mb-4">
          🎉 {t('welcomeTitle')} 🎉
        </h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          {t('checkEmail')}
        </p>
        <div className="text-sm text-gray-500">
          {t('didntGetMail')}<br />
          <span className="font-semibold">{t('checkSpam')}</span>
        </div>
      </div>
    </div>
  );
}


  // 1단계: 가입 폼
  return (
    <div className="min-h-screen bg-gray-50 pt-2 flex items-start justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <form onSubmit={handleSignUp} className="p-8 space-y-4">
          {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}

          {/* Email ★ */}
          <label className="block">
            <span className="font-medium">{t('email')} <span className="text-red-500">*</span></span>
            <input
              type="email"
              className="mt-1 w-full p-2 border rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          {/* Password ★ */}
          <label className="block">
            <span className="font-medium">{t('password')} <span className="text-red-500">*</span></span>
            <input
              type="password"
              className="mt-1 w-full p-2 border rounded"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setPasswordValid(PASSWORD_REGEX.test(e.target.value));
              }}
            />
            {!passwordValid && <p className="text-sm text-red-600">{t('passwordStrength')}</p>}
          </label>

          {/* Confirm Password ★ */}
          <label className="block">
            <span className="font-medium">{t('confirmPassword')} <span className="text-red-500">*</span></span>
            <input
              type="password"
              className="mt-1 w-full p-2 border rounded"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
            />
            {confirmPasswordError && (
              <p className="text-sm text-red-600">{confirmPasswordError}</p>
            )}
          </label>

          {/* Full Name ★ */}
      <label className="block">
        <span className="font-medium">
          {t('fullName')} <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}  // ← sanitize 제거
          required
          className="mt-1 w-full p-2 border rounded"
        />
        {nameError && (
          <p className="text-sm text-red-600">{nameError}</p>
        )}
      </label>

      {/* Nickname ★ */}
      <label className="block">
        <span className="font-medium">
          {t('nickname')} <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}  // ← sanitize 제거
          required
          className="mt-1 w-full p-2 border rounded"
        />
        {nickError && (
          <p className="text-sm text-red-600">{nickError}</p>
        )}
      </label>

      {/* Phone Number ★ */}
      <label className="block">
        <span className="font-medium">{t('phone')}</span>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
          required
          className="mt-1 w-full p-2 border rounded"
        />
      </label>

          {/* Birthdate */}
          <label className="block">
            <span className="text-gray-700">{t('birthdate')}</span>
            <input
              type="date"
              className="mt-1 w-full p-2 border rounded"
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
            />
          </label>

          {/* 🔸 필수 입력 안내 */}
          <p className="text-sm text-gray-500 mt-2">
            {t('requiredFieldsNote')}
          </p>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full p-3 text-white font-semibold rounded ${isFormValid
              ? 'bg-teal-600 hover:bg-teal-700'
              : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {loading ? t('signingUp') : t('signupButton')}
          </button>


        </form>
      </div>
    </div>
  );
}
