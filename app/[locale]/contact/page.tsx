/*
================================================================================
  3. 메인 페이지 (수정)
  파일 경로: app/[locale]/contact/page.tsx
  (이 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Mail, Instagram, MessageCircle } from 'lucide-react';
import ContactForm from './contact-form.client'; // 클라이언트 컴포넌트를 import

// SEO 메타데이터 생성
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ContactPage.meta' });
  return {
    title: t('title'),
  };
}

// Contact 페이지 (서버 컴포넌트)
export default async function ContactPage() {
  const t = await getTranslations('ContactPage');

  // 클라이언트 컴포넌트에 전달할 번역 객체
  const formTranslations = {
    formHeading: t('form.formHeading'),
    namePlaceholder: t('form.namePlaceholder'),
    emailPlaceholder: t('form.emailPlaceholder'),
    messagePlaceholder: t('form.messagePlaceholder'),
    submit: t('form.submit'),
    submitting: 'Sending...', // common.json에 추가하거나 여기에 직접 작성
    successMessage: t('form.successMessage'),
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-6">
        <div className="max-w-3xl mx-auto text-center px-4 pt-6 pb-2">
          <MessageCircle className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h1 className="text-3xl sm:text-4xl pb-2 font-bold text-gray-900">
            {t('hero.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mt-1">
            {t('hero.subtitle')}
          </p>
          <p className="text-base sm:text-lg text-gray-500 mt-1">
            {t('hero.subtitle2')}
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {/* Get in Touch 카드 (서버에서 렌더링) */}
          <div className="flex flex-col items-center text-center bg-white p-10 rounded-xl shadow-lg border border-gray-100 h-full space-y-4">
            <Mail className="w-10 h-10 text-teal-600 mb-2" />
            <h2 className="text-2xl font-semibold text-gray-800">
              {t('details.heading')}
            </h2>
            <a
              href="mailto:official@zippling.net"
              className="text-teal-600 text-lg font-medium hover:underline"
            >
              official@zippling.net
            </a>
            <p className="text-sm text-gray-500">
              {t('details.notice')}
            </p>
            <p className="text-sm text-gray-400">
              {t('details.description')}
            </p>
          </div>

          {/* Contact Form 클라이언트 컴포넌트 렌더링 */}
          <ContactForm t={formTranslations} />
        </div>
      </section>

      {/* Instagram 소셜 섹션 (서버에서 렌더링) */}
      <section className="py-6">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {t('social.heading')}
          </h3>
          <a
            href="https://instagram.com/zippling_net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-gray-600 hover:text-teal-500"
          >
            <Instagram className="w-6 h-6 mx-auto" />
          </a>
        </div>
      </section>
    </>
  );
}
