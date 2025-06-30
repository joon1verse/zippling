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

  // Form state
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [fullName,   setFullName]   = useState('');
  const [nickname,   setNickname]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [birthdate,  setBirthdate]  = useState('');

  // 이메일 확인을 위한 상태
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailMessage,    setEmailMessage]    = useState({ text: '', type: '' }); 
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 비밀번호 강도
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const [passwordValid, setPasswordValid] = useState(true);

  // 한글 검증
  const hasJamo = (s: string) => /[ㄱ-ㅎㅏ-ㅣ]/.test(s);
  const hasBadChar = (s: string) => /[^\p{L}\p{N}\-_ ]/u.test(s);

  // 이름 에러 메시지
  const nameError = useMemo(() => {
    if (!fullName) return '';
    if (hasJamo(fullName)) return t('nameHangulError');
    if (hasBadChar(fullName)) return t('nameSpecialError');
    return '';
  }, [fullName, t]);

  // 닉네임 에러 메시지
  const nickError = useMemo(() => {
    if (!nickname) return '';
    if (hasJamo(nickname)) return t('nickHangulError');
    if (/^[가-힣]+$/.test(nickname) && nickname.length < 2) return t('nickLenError');
    if (hasBadChar(nickname)) return t('nickSpecialError');
    return '';
  }, [nickname, t]);
  
  const confirmPasswordError = useMemo(() => {
    if (confirmPwd && confirmPwd !== password) {
      return t('passwordMismatchError');
    }
    return '';
  }, [password, confirmPwd, t]);

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
  }, [email, password, confirmPwd, fullName, nickname, nameError, nickError]);
  
  const [step, setStep]       = useState<'form'|'checkEmail'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  // '중복 확인' 버튼 클릭 시 실행될 함수 (API 호출 방식)
  const handleCheckEmail = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailMessage({ text: t('invalidEmailFormat'), type: 'error' });
      return;
    }

    setIsCheckingEmail(true);
    setEmailMessage({ text: '', type: '' });
    setIsEmailVerified(false);

    try {
      const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server error during email check.');
      }
      
      if (result.isTaken) {
        setEmailMessage({ text: t('emailTakenError'), type: 'error' });
      } else {
        setEmailMessage({ text: t('emailAvailable'), type: 'success' });
        setIsEmailVerified(true);
      }

    } catch (err: any) {
      console.error(err);
      setEmailMessage({ text: t('emailCheckError'), type: 'error' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setEmailMessage({ text: t('emailNotVerified'), type: 'error' });
      return;
    }
    setError(null);

    if (!PASSWORD_REGEX.test(password)) return setError(t('passwordStrength'));
    if (password !== confirmPwd) return setError(t('passwordMismatch'));
    if (nameError) return setError(nameError);
    if (nickError) return setError(nickError);

    setLoading(true);

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

  return (
    <div className="min-h-screen bg-gray-50 pt-2 flex items-start justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <form onSubmit={handleSignUp} className="p-8 space-y-4">
          {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}

          {/* Email ★ (버튼 방식으로 수정) */}
          <label className="block">
            <span className="font-medium">{t('email')} <span className="text-red-500">*</span></span>
            <div className="flex items-center mt-1 gap-x-2"> {/* 1. gap-x-2 추가로 간격 생성 */}
              <input
                type="email"
                className="flex-grow w-full p-2 border rounded-md"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                  setEmailMessage({ text: '', type: '' });
                }}
              />
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={isCheckingEmail}
                /* 3. 홈페이지 테마에 맞게 버튼 스타일 수정 */
                className="px-4 py-2 rounded-md bg-teal-500 text-white text-sm font-semibold whitespace-nowrap hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isCheckingEmail ? t('checking') : t('checkButton')}
              </button>
            </div>
            {emailMessage.text && (
              <p className={`text-sm mt-1 ${emailMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {emailMessage.text}
              </p>
            )}
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
              onChange={e => setFullName(e.target.value)}
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
              onChange={e => setNickname(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded"
            />
            {nickError && (
              <p className="text-sm text-red-600">{nickError}</p>
            )}
          </label>

          {/* Phone Number */}
          <label className="block">
            <span className="font-medium">{t('phone')}</span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
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

          <p className="text-sm text-gray-500 mt-2">
            {t('requiredFieldsNote')}
          </p>

          <button
            type="submit"
            disabled={!isFormValid || loading || !isEmailVerified}
            className={`w-full p-3 text-white font-semibold rounded ${
              (isFormValid && !loading && isEmailVerified)
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
