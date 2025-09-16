// app/[locale]/vancouver/guides/housing/page.tsx
// [설명]
// - 이전의 '단일 카드 + 본문' 레이아웃을 유지하면서 미적요소만 보강
// - TOC는 간단한 칩 그리드(모바일 2열, 데스크탑 4열)로 제공, 스티키/사이드바 없음
// - ESM/Next 14/next-intl(server) 준수, 네임스페이스는 vancouver.HousingGuide
// - 번역키는 다음 단계에서 다듬자(지금은 기존 키들만 사용)

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Quote,
  ShoppingCart,
  Briefcase,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Home,
  MapPin,
  ClipboardCheck,
  FileText,
  Plug,
  Truck,
  ShieldAlert,
  BookOpen,
  Globe
} from 'lucide-react';
import React from 'react';

type Props = { params: { locale: string } };

// [SEO] meta 키만 사용: vancouver.HousingGuide.meta.title/description
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'vancouver.HousingGuide.meta' });
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function HousingGuidePage({ params: { locale } }: Props) {
  const t = await getTranslations('vancouver.HousingGuide');

  // [TOC 데이터] — 섹션 id와 매칭 (레이아웃 단순: 칩 그리드만)
  const toc = [
    { id: 'rent-basics', icon: Home, label: t('toc.rentBasics') },
    { id: 'where-to-search', icon: MapPin, label: t('toc.whereToSearch') },
    { id: 'viewing-checklist', icon: ClipboardCheck, label: t('toc.viewingChecklist') },
    { id: 'application', icon: FileText, label: t('toc.application') },
    { id: 'lease-utilities', icon: Plug, label: t('toc.leaseUtilities') },
    { id: 'move-in', icon: Truck, label: t('toc.moveIn') },
    { id: 'safety-scams', icon: ShieldAlert, label: t('toc.safetyScams') },
    { id: 'glossary', icon: BookOpen, label: t('toc.glossary') }
  ];

  return (
    <main className="bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link
            href={`/${locale}/vancouver/guides`}
            className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-teal-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToGuides')}
          </Link>
        </div>

        {/* 단일 카드 컨테이너 (이전 레이아웃 유지) */}
        <article className="rounded-3xl bg-white/95 backdrop-blur p-8 sm:p-12 shadow-lg ring-1 ring-gray-900/5">
          {/* 헤더 */}
          <header className="text-center">
            {/* [미적 강화] 그라데이션 타이틀 */}
            <h1 className="text-4xl sm:text-5xl pb-4 font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {t('pageTitle')}
            </h1>

            {/* 서브텍스트(없으면 영어 한 줄 기본값) */}
            <p className="mt-3 text-base sm:text-lg text-gray-500">
              {t('subtitle') ?? 'Practical steps to rent and move in—no fluff, just what you need.'}
            </p>

            {/* 메타 라인 */}
            <div className="mt-5 flex flex-col items-center gap-2 text-sm text-gray-600 sm:flex-row sm:justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 font-semibold text-teal-800">
                <Globe className="h-4 w-4" />
                {t('languageSupport')}
              </span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="font-medium text-gray-500">{t('updatedDate')}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium text-gray-500">{t('readingTime')}</span>
            </div>
          </header>

          {/* 구분선 */}
          <hr className="my-8 border-gray-200" />

            <section className="mt-8">
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
                <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-1.5 rounded-full bg-teal-500/80" />
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
                    <Quote className="h-4 w-4" />
                    Intro
                    </div>
                    <p className="text-[1.06rem] sm:text-lg leading-8 text-gray-700">
                    {t('intro')}
                    </p>
                </div>
                </div>
            </div>
            </section>

          {/* 간단 TOC (칩 그리드) — 복잡한 사이드/스티키 없이 심플하게 */}
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('toc.title')}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow md:text-[0.94rem]"
                >
                  <item.icon className="h-4 w-4 text-teal-600 transition group-hover:scale-110" />
                  <span className="truncate">{item.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* 본문 섹션들 — 단일 컬럼, 앵커만 제공 */}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <section id="rent-basics" className="scroll-mt-24 pt-2">
              <h2>{t('sections.rentBasics.title')}</h2>
              <p>{t('sections.rentBasics.p1')}</p>
              <ul>
                <li>{t('sections.rentBasics.li1')}</li>
                <li>{t('sections.rentBasics.li2')}</li>
                <li>{t('sections.rentBasics.li3')}</li>
              </ul>
            </section>

            <section id="where-to-search" className="scroll-mt-24 pt-2">
              <h2>{t('sections.whereToSearch.title')}</h2>
              <p>{t('sections.whereToSearch.p1')}</p>
                <div className="mt-4">
                <Link
                    href={`/${locale}/vancouver/room`}
                    aria-label={t('sections.whereToSearch.ctaButton')}
                    className="group inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-800"
                >
                    <span className="relative">
                    {t('sections.whereToSearch.ctaButton')}
                    {/* hover 시 자연스럽게 생기는 언더라인 */}
                    <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-current transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>

                {/* 보조 캡션: 톤 다운 */}
                <p className="mt-1.5 text-xs text-gray-500">
                    {t('sections.whereToSearch.ctaSub')}
                </p>
                </div>
              <ul>
                <li>{t('sections.whereToSearch.li1')}</li>
                <li>{t('sections.whereToSearch.li2')}</li>
                <li>{t('sections.whereToSearch.li3')}</li>
              </ul>
            </section>

            <section id="viewing-checklist" className="scroll-mt-24 pt-2">
              <h2>{t('sections.viewingChecklist.title')}</h2>
              <p>{t('sections.viewingChecklist.p1')}</p>
              <ul>
                <li>{t('sections.viewingChecklist.li1')}</li>
                <li>{t('sections.viewingChecklist.li2')}</li>
                <li>{t('sections.viewingChecklist.li3')}</li>
                <li>{t('sections.viewingChecklist.li4')}</li>
              </ul>
            </section>

            <section id="application" className="scroll-mt-24 pt-2">
              <h2>{t('sections.application.title')}</h2>
              <p>{t('sections.application.p1')}</p>
              <ul>
                <li>{t('sections.application.li1')}</li>
                <li>{t('sections.application.li2')}</li>
                <li>{t('sections.application.li3')}</li>
              </ul>
            </section>

            <section id="lease-utilities" className="scroll-mt-24 pt-2">
              <h2>{t('sections.leaseUtilities.title')}</h2>
              <p>{t('sections.leaseUtilities.p1')}</p>
              <ul>
                <li>{t('sections.leaseUtilities.li1')}</li>
                <li>{t('sections.leaseUtilities.li2')}</li>
                <li>{t('sections.leaseUtilities.li3')}</li>
              </ul>
            </section>

            <section id="move-in" className="scroll-mt-24 pt-2">
              <h2>{t('sections.moveIn.title')}</h2>
              <p>{t('sections.moveIn.p1')}</p>
              <ul>
                <li>{t('sections.moveIn.li1')}</li>
                <li>{t('sections.moveIn.li2')}</li>
                <li>{t('sections.moveIn.li3')}</li>
              </ul>
            </section>

            <section id="safety-scams" className="scroll-mt-24 pt-2">
              <h2>{t('sections.safetyScams.title')}</h2>
              <p>{t('sections.safetyScams.p1')}</p>
              <ul>
                <li>{t('sections.safetyScams.li1')}</li>
                <li>{t('sections.safetyScams.li2')}</li>
                <li>{t('sections.safetyScams.li3')}</li>
              </ul>
            </section>

            <section id="glossary" className="scroll-mt-24 pt-2">
              <h2>{t('sections.glossary.title')}</h2>
              <p>{t('sections.glossary.p1')}</p>
              <ul>
                <li>{t('sections.glossary.li1')}</li>
                <li>{t('sections.glossary.li2')}</li>
                <li>{t('sections.glossary.li3')}</li>
                <li>{t('sections.glossary.li4')}</li>
                <li>{t('sections.glossary.li5')}</li>
              </ul>
            </section>

{/* 다음 가이드 CTA — 개별 카드 + 밑줄 제거 */}
<div className="not-prose mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
  {/* 생활 & 쇼핑 */}
  <Link
    href={`/${locale}/vancouver/guides/shopping`}
    aria-label={t('nextGuides.shopping')}
    className="no-underline group flex items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-6 py-4 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors hover:border-teal-300 hover:bg-teal-50/60"
  >
    <span className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-100">
        <ShoppingCart className="h-4 w-4 text-teal-700" />
      </span>
      {t('nextGuides.shopping')}
    </span>
    <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-0.5" />
  </Link>

  {/* 일자리 & 재정 */}
  <Link
    href={`/${locale}/vancouver/guides/work-finance`}
    aria-label={t('nextGuides.workFinance')}
    className="no-underline group flex items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-6 py-4 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors hover:border-teal-300 hover:bg-teal-50/60"
  >
    <span className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-100">
        <Briefcase className="h-4 w-4 text-teal-700" />
      </span>
      {t('nextGuides.workFinance')}
    </span>
    <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-0.5" />
  </Link>
</div>


          </div>
        </article>
      </div>
    </main>
  );
}
