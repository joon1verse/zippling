/*
================================================================================
  2. 클라이언트 컴포넌트 (신규 생성)
  파일 경로: app/[locale]/signup/signup-form.client.tsx
  (이 파일을 새로 생성해주세요.)
================================================================================
*/
'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { checkEmailAvailabilityAction, signupAction, verifyOtpAction } from './actions';

// --- 유효성 검사 및 상수 ---
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const RESERVED_NAMES = ['admin', 'administrator', '운영자', '관리자', 'master', 'root', 'system', 'zippling', 'superuser', '管理者', '管理人', 'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'dick', 'pussy'];

// --- 제출 버튼 컴포넌트 ---
function SubmitButton({ text, pendingText }: { text: string, pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full p-3 bg-teal-600 text-white font-semibold rounded-lg disabled:bg-gray-400 transition-colors">
      {pending ? pendingText : text}
    </button>
  );
}

function PrimarySubmitButton({ text, pendingText, disabled }: { text: string, pendingText: string, disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={disabled || pending} className="w-full p-3 text-white font-semibold rounded-lg transition-colors bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
            {pending ? pendingText : text}
        </button>
    );
}

// --- 메인 컴포넌트 ---
export default function SignUpForm({ locale }: { locale: string }) {
  const t = useTranslations('AuthPage.SignUpPage');

  // --- 상태 관리 ---
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formValues, setFormValues] = useState({
    email: '', password: '', confirmPwd: '', fullName: '', nickname: '', phone: '', birthdate: ''
  });

  const [isCheckingEmail, startEmailCheck] = useTransition();
  const [emailMessage, setEmailMessage] = useState({ text: '', type: '' });
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 서버 액션 상태
  const [signupState, signupFormAction] = useFormState(signupAction, { success: false, message: null });
  const [verifyState, verifyFormAction] = useFormState(verifyOtpAction, { success: false, message: null });

  // --- 유효성 검사 ---
  const passwordValid = useMemo(() => PASSWORD_REGEX.test(formValues.password), [formValues.password]);
  const hasJamo = (s: string) => /[ㄱ-ㅎㅏ-ㅣ]/.test(s);
  const hasBadChar = (s: string) => /[^\p{L}\p{N}\-_ ]/u.test(s);

  const nameError = useMemo(() => {
    if (!formValues.fullName) return '';
    if (RESERVED_NAMES.some(r => formValues.fullName.toLowerCase().includes(r))) return t('nameReservedError');
    if (hasJamo(formValues.fullName)) return t('nameHangulError');
    if (hasBadChar(formValues.fullName)) return t('nameSpecialError');
    return '';
  }, [formValues.fullName, t]);

  const nickError = useMemo(() => {
    if (!formValues.nickname) return '';
    if (RESERVED_NAMES.some(r => formValues.nickname.toLowerCase().includes(r))) return t('nickReservedError');
    if (hasJamo(formValues.nickname)) return t('nickHangulError');
    if (hasBadChar(formValues.nickname)) return t('nickSpecialError');
    return '';
  }, [formValues.nickname, t]);

  const confirmPasswordError = useMemo(() => (formValues.confirmPwd && formValues.confirmPwd !== formValues.password) ? t('passwordMismatchError') : '', [formValues.password, formValues.confirmPwd, t]);
  
  const isFormValid = useMemo(() => (
    formValues.email && formValues.password && formValues.confirmPwd && formValues.fullName && formValues.nickname &&
    passwordValid && formValues.password === formValues.confirmPwd && !nameError && !nickError && isEmailVerified
  ), [formValues, passwordValid, nameError, nickError, isEmailVerified]);

  // --- 핸들러 & 이펙트 ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'phone' ? value.replace(/\D/g, '') : value;
    setFormValues(prev => ({ ...prev, [name]: processedValue }));
    if (name === 'email') {
      setIsEmailVerified(false);
      setEmailMessage({ text: '', type: '' });
    }
  };

  const handleCheckEmail = () => {
    startEmailCheck(async () => {
      const result = await checkEmailAvailabilityAction(formValues.email);
      if (result.error) {
        setEmailMessage({ text: t(result.error), type: 'error' });
      } else if (result.isTaken) {
        setEmailMessage({ text: t('emailTakenError'), type: 'error' });
      } else {
        setEmailMessage({ text: t('emailAvailable'), type: 'success' });
        setIsEmailVerified(true);
      }
    });
  };

  useEffect(() => {
    if (signupState.success) {
      setStep('verify');
    }
  }, [signupState]);

  // --- UI 렌더링 ---
  if (step === 'verify') {
    return (
    // [수정] shadow-xl 대신, 명확한 테두리(border)와 약간의 그림자(shadow-lg)를 추가합니다.
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-4">{t('verifyTitle')}</h1>
        <p className="text-center text-gray-600 mb-6">{t('verifyInstructions', { email: formValues.email })}</p>
        <form action={verifyFormAction} className="space-y-4">
          <input type="hidden" name="email" value={formValues.email} />
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="font-medium text-gray-700">Verification Code</span>
            <input type="text" name="token" required className="mt-1 w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </label>
          {verifyState.message && <p className="text-red-600 mt-2">{verifyState.message}</p>}
          <SubmitButton text={t('verifyButton')} pendingText={t('verifying')} />
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      <form action={signupFormAction} className="p-8 space-y-4">
        {signupState.message && <div className="bg-red-100 text-red-800 p-2 rounded">{signupState.message}</div>}
        
        {/* 모든 input에 name 속성 추가 */}
        <input type="hidden" name="phone" value={formValues.phone} />
        <input type="hidden" name="birthdate" value={formValues.birthdate} />

        <label className="block">
          <span className="font-medium text-gray-700">{t('email')} <span className="text-red-500">*</span></span>
          <div className="flex items-center mt-1 space-x-2">
            <input type="email" name="email" value={formValues.email} onChange={handleInputChange} required placeholder="you@example.com" className="flex-grow w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <button type="button" onClick={handleCheckEmail} disabled={isCheckingEmail} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:bg-gray-300 whitespace-nowrap">
              {isCheckingEmail ? t('checking') : t('checkButton')}
            </button>
          </div>
          {emailMessage.text && <p className={`text-sm mt-1.5 ${emailMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{emailMessage.text}</p>}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('password')} <span className="text-red-500">*</span></span>
          <input type="password" name="password" value={formValues.password} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          {formValues.password && !passwordValid && <p className="text-sm mt-1.5 text-red-600">{t('passwordStrength')}</p>}
        </label>
        
        <label className="block">
          <span className="font-medium text-gray-700">{t('confirmPassword')} <span className="text-red-500">*</span></span>
          <input type="password" name="confirmPwd" value={formValues.confirmPwd} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          {confirmPasswordError && <p className="text-sm mt-1.5 text-red-600">{confirmPasswordError}</p>}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('fullName')} <span className="text-red-500">*</span></span>
          <input type="text" name="fullName" value={formValues.fullName} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          {nameError && <p className="text-sm mt-1.5 text-red-600">{nameError}</p>}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('nickname')} <span className="text-red-500">*</span></span>
          <input type="text" name="nickname" value={formValues.nickname} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          {nickError && <p className="text-sm mt-1.5 text-red-600">{nickError}</p>}
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('phone')}</span>
          <input type="tel" name="phone" value={formValues.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">{t('birthdate')}</span>
          <input type="date" name="birthdate" value={formValues.birthdate} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </label>

        <p className="text-sm text-gray-500 mt-2">{t('requiredFieldsNote')}</p>
        <PrimarySubmitButton text={t('signupButton')} pendingText={t('signingUp')} disabled={!isFormValid} />
      </form>
    </div>
  );
}