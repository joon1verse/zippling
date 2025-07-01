// app/[locale]/signup/page.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';
// OTP 검증을 위한 서버 액션을 가져옵니다.
import { verifyOtpAndSaveProfile } from './actions';

export default function SignUpPage() {
  const t         = useTranslations('signup');
  const { locale }= useParams<{ locale: string }>();
  const router    = useRouter();
  const supabase  = useSupabaseClient();

  // --- 상태 관리 ---
  const [step, setStep]           = useState<'form' | 'verify'>('form');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [otp, setOtp]             = useState('');
  
  // Form State
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [fullName,   setFullName]   = useState('');
  const [nickname,   setNickname]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [birthdate,  setBirthdate]  = useState('');
  const RESERVED_NAMES = [
    // 관리자/시스템 관련 (Admin/System)
    'admin', 'administrator', '운영자', '관리자', 'master', 'root', 'system', 'zippling', 'superuser', '管理者', '管理人',
    
    // 일반적인 비속어 및 욕설 - 한국어 (Korean)
    '씨발', '시발', 'ㅅㅂ', '병신', 'ㅄ', '좆', '좇', '개새끼', '새끼', '미친', '지랄', '염병', '썅', '등신', '또라이', '애미', '느금마', '애비',
    
    // 일반적인 비속어 및 욕설 - 영어 (English)
    'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'dick', 'pussy', 'wanker', 'slut', 'whore',
    
    // 일반적인 비속어 및 욕설 - 일본어 (Japanese)
    '馬鹿', 'バカ', 'ばか', '阿呆', 'アホ', 'あほ', '糞', 'クソ', 'くそ', '死ね', 'しね', 'ブス', 'デブ', 'チビ', 'インポ', 'マンコ', 'チンコ',
  
    // 차별 및 혐오 표현 (Hate Speech & Slurs)
    'nigger', 'nigga', 'faggot', 'tranny', 'retard', // 영어
    '일베', '메갈', '워마드', '페미', '한남', '한녀', '김치녀', '된장녀', '맘충', '틀딱', '급식충', // 한국어
    'キチガイ', 'ガイジ', '部落' // 일본어
  ];
  
  // 이메일 중복 확인을 위한 상태
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailMessage,    setEmailMessage]    = useState({ text: '', type: '' }); 
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 확인 완료 여부

  // --- 유효성 검사 로직 ---
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const [passwordValid, setPasswordValid] = useState(true);

  const hasJamo = (s: string) => /[ㄱ-ㅎㅏ-ㅣ]/.test(s);
  const hasBadChar = (s: string) => /[^\p{L}\p{N}\-_ ]/u.test(s);

  const nameError = useMemo(() => {
    if (!fullName) return '';
    // 금지어 검사 로직
    if (RESERVED_NAMES.some(reserved => fullName.toLowerCase().includes(reserved))) {
      return t('nameReservedError'); // 번역 키
    }
    if (hasJamo(fullName)) return t('nameHangulError');
    if (hasBadChar(fullName)) return t('nameSpecialError');
    return '';
  }, [fullName, t]);

  const nickError = useMemo(() => {
    if (!nickname) return '';
    // 금지어 검사 로직
    if (RESERVED_NAMES.some(reserved => nickname.toLowerCase().includes(reserved))) {
      return t('nickReservedError'); // 번역 키
    }
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


  // --- 핸들러 함수들 ---
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
      if (!response.ok) throw new Error(result.error || 'Server error');
      if (result.isTaken) {
        setEmailMessage({ text: t('emailTakenError'), type: 'error' });
      } else {
        setEmailMessage({ text: t('emailAvailable'), type: 'success' });
        setIsEmailVerified(true);
      }
    } catch (err) {
      console.error(err);
      setEmailMessage({ text: t('emailCheckError'), type: 'error' });
    } finally {
      setIsCheckingEmail(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // 이메일 중복 확인을 통과했는지 먼저 검사
    if (!isEmailVerified) {
      setEmailMessage({ text: t('emailNotVerified'), type: 'error' });
      return;
    }
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:     fullName,
          user_nickname: nickname,
          phone,
          birthdate,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setStep('verify');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('token', otp);
    const result = await verifyOtpAndSaveProfile(formData);
    if (result.error) {
      setError(result.error);
    } else {
      router.push(`/${locale}/signup/success`);
    }
    setLoading(false);
  }

  // OTP(인증) 폼 UI
  if (step === 'verify') {
    return (
      <div className="pt-12 px-4 flex justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-4">{t('verifyTitle')}</h1>
          <p className="text-center text-gray-600 mb-6">{t('verifyInstructions', { email })}</p>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <label className="block">
              <span className="font-medium text-gray-700">Verification Code</span>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </label>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            <button type="submit" disabled={loading} className="w-full p-3 bg-teal-600 text-white font-semibold rounded-lg disabled:bg-gray-400 transition-colors">
              {loading ? t('verifying') : t('verifyButton')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 가입 폼 UI
return (
  <div className="min-h-screen bg-gray-50 pt-2 flex items-start justify-center">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      <form onSubmit={handleSignUp} className="p-8 space-y-4">
        {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}
        
        <label className="block">
          <span className="font-medium text-gray-700">{t('email')} <span className="text-red-500">*</span></span>
          {/* 이메일 입력칸과 버튼을 flex 컨테이너로 묶어 분리합니다. */}
          <div className="flex items-center mt-1 space-x-2">
            <input
              type="email"
              // 입력칸 패딩을 p-2로 수정합니다.
              className="flex-grow w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              value={email}
              placeholder="you@example.com"
              onChange={e => {
                setEmail(e.target.value);
                setIsEmailVerified(false);
                setEmailMessage({ text: '', type: '' });
              }}
              required
            />
            {/* 버튼 스타일을 teal 색상 테마로 변경하고, 패딩을 조정합니다. */}
            <button
              type="button"
              onClick={handleCheckEmail}
              disabled={isCheckingEmail}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isCheckingEmail ? t('checking') : t('checkButton')}
            </button>
          </div>
          {emailMessage.text && (
            <p className={`text-sm mt-1.5 ${emailMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {emailMessage.text}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('password')} <span className="text-red-500">*</span></span>
          <input
            type="password"
            // 입력칸 패딩을 p-2로 수정합니다.
            className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setPasswordValid(PASSWORD_REGEX.test(e.target.value));
            }}
          />
          {!passwordValid && <p className="text-sm mt-1.5 text-red-600">{t('passwordStrength')}</p>}
        </label>
        
        <label className="block">
          <span className="font-medium text-gray-700">{t('confirmPassword')} <span className="text-red-500">*</span></span>
          <input
            type="password"
            // 입력칸 패딩을 p-2로 수정합니다.
            className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
          />
          {confirmPasswordError && (
            <p className="text-sm mt-1.5 text-red-600">{confirmPasswordError}</p>
          )}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('fullName')} <span className="text-red-500">*</span></span>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            // 입력칸 패딩을 p-2로 수정합니다.
            className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {nameError && (
            <p className="text-sm mt-1.5 text-red-600">{nameError}</p>
          )}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('nickname')} <span className="text-red-500">*</span></span>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
            // 입력칸 패딩을 p-2로 수정합니다.
            className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {nickError && (
            <p className="text-sm mt-1.5 text-red-600">{nickError}</p>
          )}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('phone')}</span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            // 입력칸 패딩을 p-2로 수정합니다.
            className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('birthdate')}</span>
          <input
            type="date"
            // 입력칸 패딩을 p-2로 수정합니다.
            className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
          />
        </label>

        <p className="text-sm text-gray-500 mt-2">{t('requiredFieldsNote')}</p>

        <button
          type="submit"
          disabled={!isFormValid || loading || !isEmailVerified}
          className={`w-full p-3 text-white font-semibold rounded-lg transition-colors ${
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
