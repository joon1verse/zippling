/*
================================================================================
  2. 클라이언트 컴포넌트 (신규 생성)
  파일 경로: app/[locale]/login/login-form.client.tsx
  (이 파일을 새로 생성해주세요.)
================================================================================
*/
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { loginAction } from './actions';

// 폼 제출 버튼 컴포넌트
function LoginButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('AuthPage.SignInPage');

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-teal-600 hover:bg-teal-700 mt-6 mb-3 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400"
    >
      {pending ? t('loggingIn') : t('loginButton')}
    </button>
  );
}

interface LoginFormProps {
  locale: string;
  redirectUrl: string | null;
}

export default function LoginForm({ locale, redirectUrl }: LoginFormProps) {
  // [수정] 번역 네임스페이스를 'signin' -> 'SignInPage'로 변경
  const t = useTranslations('AuthPage.SignInPage');
  const [state, formAction] = useFormState(loginAction, { message: null });

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <div className="px-8 py-4 space-y-4">
        {state?.message && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm">
            {/* [수정] 서버 액션에서 받은 에러 메시지를 표시 */}
            {t('error', { message: state.message })}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          {/* 서버 액션에 필요한 숨겨진 필드 */}
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirectUrl" value={redirectUrl || ''} />

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-base">
              {t('email')}
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              className="w-full pl-4 pr-14 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-base">
              {t('password')}
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full pl-4 pr-14 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
            />
          </div>

          <LoginButton />
        </form>
      </div>
    </div>
  );
}