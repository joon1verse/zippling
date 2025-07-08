// app/[locale]/vancouver/guides/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Home, ShoppingCart, Briefcase, ChevronRight, ArrowLeft, Globe } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';

// 가이드 링크 버튼을 위한 Props 타입 정의
interface GuideLinkProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  locale: string;
}

/**
 * 개별 가이드 링크를 표시하는 재사용 가능한 컴포넌트입니다.
 * 시각적 매력을 더하기 위해 아이콘과 호버 효과를 개선했습니다.
 */
const GuideLink: React.FC<GuideLinkProps> = ({ href, icon: Icon, title, description, locale }) => {
  return (
    <Link
      href={`/${locale}${href}`}
      className="group block bg-white p-6 border border-gray-200/80 rounded-xl shadow-sm transition-all duration-300 hover:border-teal-400 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center">
        {/* 아이콘 영역 (원형 배경으로 변경) */}
        <div className="flex-shrink-0 bg-teal-100/70 p-3 rounded-full mr-5">
          <Icon className="w-6 h-6 text-teal-700" />
        </div>
        {/* 제목과 설명 영역 */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {/* 바로가기 화살표 아이콘 */}
        <ChevronRight className="w-6 h-6 text-gray-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-teal-500 ml-4" />
      </div>
    </Link>
  );
};


/**
 * 밴쿠버 정착 가이드 메인 페이지 컴포넌트입니다.
 * 시각적 풍성함을 더하기 위해 배경색, 뒤로가기 버튼, 인용구 등을 추가했습니다.
 */
export default function VancouverGuidesPage() {
  const t = useTranslations('van_guides');
  const { locale } = useParams() as { locale: string };

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
    // 페이지 전체에 미색 배경 적용
    <main className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
            <Link href={`/${locale}/vancouver`} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToVancouver')}
            </Link>
        </div>

        {/* 메인 콘텐츠 영역 (흰색 배경 카드) */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm">
            {/* 데스크탑에서 2단 그리드 레이아웃 적용 */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-x-16">
            
            {/* 왼쪽 컬럼: 아티클 (제목 및 소개글) */}
            <div className="lg:col-span-2">
                <header>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        {t('pageTitle')}
                    </h1>
                    {/* 언어 지원 및 업데이트 날짜 정보 강조 */}
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
                        {/* 시각적 강조를 위한 인용구 추가 */}
                        <blockquote className="border-l-4 border-teal-400 pl-6 py-2 my-6 text-gray-700 italic">
                          {t('quote')}
                        </blockquote>
                        <p>{t('intro2')}</p>
                    </div>
                </header>
            </div>

            {/* 오른쪽 컬럼: 가이드 링크 버튼 */}
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
