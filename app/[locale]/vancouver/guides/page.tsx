import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Home, ShoppingCart, Briefcase, ArrowLeft, Globe } from 'lucide-react';
import React from 'react';
import GuideLink from './guide-link'; // [수정] 같은 폴더에서 import
import type { Metadata } from 'next';

type Props = {
  params: { locale: string };
}

// SEO를 위한 동적 메타데이터 생성
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'vancouver.GuidesPage.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

// 페이지 컴포넌트
export default async function VancouverGuidesPage({ params: { locale } }: Props) {
  const t = await getTranslations('vancouver.GuidesPage');

  const guides = [
    {
      href: '/vancouver/guides/housing',
      icon: Home,
      title: t('housing.title'),
      description: t('housing.description'),
    },
    {
      href: '/vancouver/guides/shopping',
      icon: ShoppingCart,
      title: t('shopping.title'),
      description: t('shopping.description'),
    },
    {
      href: '/vancouver/guides/work-finance',
      icon: Briefcase,
      title: t('work_finance.title'),
      description: t('work_finance.description'),
    },
  ];

  return (
    <main className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        
        <div className="mb-8">
            <Link href={`/${locale}/vancouver`} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToVancouver')}
            </Link>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm">
            <div className="lg:grid lg:grid-cols-3 lg:gap-x-16">
            
            <div className="lg:col-span-2">
                <header>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        {t('pageTitle')}
                    </h1>
                    <div className="mt-6 flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                        <div className="inline-flex items-center bg-teal-50 text-teal-800 rounded-full px-4 py-1.5">
                            <Globe className="w-4 h-4 mr-2.5" />
                            <span className="font-semibold">{t('languageSupport')}</span>
                        </div>
                        <span className="font-medium text-gray-500">{t('updatedDate')}</span> 
                    </div>
                    <hr className="my-8 border-gray-200" />
                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-6">
                        <p>{t('intro1')}</p>
                        <blockquote className="border-l-4 border-teal-400 pl-6 py-2 my-6 text-gray-700 italic">
                          {t('quote')}
                        </blockquote>
                        <p>{t('intro2')}</p>
                    </div>
                </header>
            </div>

            <aside className="lg:col-span-1 mt-16 lg:mt-0">
                <div className="space-y-5">
                {guides.map((guide) => (
                    <GuideLink
                    key={guide.href}
                    href={guide.href}
                    icon={guide.icon}
                    title={guide.title}
                    description={guide.description}
                    locale={locale}
                    />
                ))}
                </div>
            </aside>

            </div>
        </div>
      </div>
    </main>
  );
}