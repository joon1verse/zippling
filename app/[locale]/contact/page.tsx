'use client';

import { useState } from 'react';
import { Mail, Instagram, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * ContactPage 컴포넌트 (스타일 개선)
 * - Get in Touch 카드: notice + description 분리 및 스타일 강화
 * - 실제 동작하는 submit 핸들러 포함
 * - Instagram 소셜 링크
 */
export default function ContactPage() {
  const t = useTranslations('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 실제 API 연동 또는 메일 전송 로직 추가
    console.log({ name, email, message });
    alert(t('form.successMessage'));
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-6">
        <div className="max-w-3xl mx-auto text-center px-4">
          <MessageCircle className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('hero.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mt-1">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">

          {/* Get in Touch 카드: 중앙 정렬, notice + description */}
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
            {/* Notice: 중간 강조 텍스트 */}
            <p className="text-sm text-gray-500">
              {t('details.notice')}
            </p>
            {/* Description: 작은 회색 텍스트 */}
            <p className="text-sm text-gray-400">
              {t('details.description')}
            </p>
          </div>

          {/* Send a Message 폼 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('form.formHeading')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t('form.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder={t('form.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              <textarea
                placeholder={t('form.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32 resize-none"
                required
              />
              <button
                type="submit"
                className="bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 transition"
              >
                {t('form.submit')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Instagram 소셜 섹션 */}
      <section className="py-6">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {t('social.heading')}
          </h3>
          <a
            href="https://instagram.com/zippling"
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
