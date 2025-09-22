// app/[locale]/vancouver/guides/shopping/page.tsx
// [Phase 4.6 Update — 모바일 2열 + 더 작은 카드 / 고정 초기 줌으로 Google Maps 검색]

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Store,
  Smartphone,
  MonitorSmartphone,
  Package,
  CreditCard,
  MapPin,
  BadgePercent,
  Globe,
  ShieldAlert
} from 'lucide-react';

// ----------------------------
// (shopping-0) 타입 정의
// ----------------------------
export type StoreCard = {
  slug: string;
  nameKey: string; // 번역키: stores.{slug}.name
  summaryKey: string; // 번역키: stores.{slug}.summary
  category: 'supermarket' | 'electronics' | 'household' | 'asian' | 'convenience' | 'online';
  image?: string;
};

// ----------------------------
// (shopping-1) 목차(TOC)
// ----------------------------
const toc = (
  t: (key: string) => string
): { id: string; icon: React.ElementType; label: string }[] => [
  { id: 'overview', icon: ShoppingCart, label: t('toc.overview') },
  { id: 'supermarkets', icon: Store, label: t('toc.supermarkets') },
  { id: 'electronics', icon: MonitorSmartphone, label: t('toc.electronics') },
  { id: 'household', icon: Package, label: t('toc.household') },
  { id: 'asian', icon: Globe, label: t('toc.asian') },
  { id: 'convenience', icon: Smartphone, label: t('toc.convenience') },
  { id: 'online', icon: CreditCard, label: t('toc.online') }
];

// ----------------------------
// (shopping-2) 초기 카드 데이터
// ----------------------------
const initialCards: StoreCard[] = [
  { slug: 'iga', nameKey: 'stores.iga.name', summaryKey: 'stores.iga.summary', category: 'supermarket', image: '/images/shopping/iga_main.png' },
  { slug: 'noFrills', nameKey: 'stores.noFrills.name', summaryKey: 'stores.noFrills.summary', category: 'supermarket', image: '/images/shopping/nof_main.png' },
  { slug: 'safeWay', nameKey: 'stores.safeWay.name', summaryKey: 'stores.safeWay.summary', category: 'supermarket', image: '/images/shopping/safeWay_main.png' },
  { slug: 'hMart', nameKey: 'stores.hMart.name', summaryKey: 'stores.hMart.summary', category: 'asian', image: '/images/shopping/hmart_main.png' },
  { slug: 'hannamMart', nameKey: 'stores.hannamMart.name', summaryKey: 'stores.hannamMart.summary', category: 'asian', image: '/images/shopping/hannamMart_main.png' },
  { slug: 'tAndT', nameKey: 'stores.tAndT.name', summaryKey: 'stores.tAndT.summary', category: 'asian', image: '/images/shopping/tAndT_main.png' },
  { slug: 'konbiniya', nameKey: 'stores.konbiniya.name', summaryKey: 'stores.konbiniya.summary', category: 'convenience', image: '/images/shopping/konbiniya_main.png' },
  { slug: 'sevenEleven', nameKey: 'stores.sevenEleven.name', summaryKey: 'stores.sevenEleven.summary', category: 'convenience', image: '/images/shopping/sevenEleven_main.png' },
  { slug: 'bestBuy', nameKey: 'stores.bestBuy.name', summaryKey: 'stores.bestBuy.summary', category: 'electronics', image: '/images/shopping/bestbuy_main.png' },
  { slug: 'londonDrugs', nameKey: 'stores.londonDrugs.name', summaryKey: 'stores.londonDrugs.summary', category: 'household', image: '/images/shopping/londondrugs_main.png' },
  { slug: 'shoppersDrug', nameKey: 'stores.shoppersDrug.name', summaryKey: 'stores.shoppersDrug.summary', category: 'household', image: '/images/shopping/shoppersDrug_main.png' }
];

// ----------------------------
// (shopping-3) SEO 메타
// ----------------------------
export type Props = { params: { locale: string } };
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'vancouver.ShoppingGuide.meta' });
  return { title: t('title'), description: t('description') };
}

// ----------------------------
// (shopping-4) Google Maps 검색 URL 함수 (다운타운 중심/줌 고정)
// ----------------------------
function mapSearchUrl(name: string) {
  const query = encodeURIComponent(name + ' Vancouver');
  return `https://www.google.com/maps/search/${query}/@49.2827,-123.1207,13z`;
}

// ----------------------------
// (shopping-5) 카드 컴포넌트 — 모바일 축소 스타일
// ----------------------------
function MiniCard({ card, t }: { card: StoreCard; t: (key: string) => string }) {
  const name = t(card.nameKey);
  const summary = t(card.summaryKey);

  return (
    <a
    href={mapSearchUrl(name)}
    target="_blank"
    rel="noopener noreferrer"
    className="not-prose group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow"
    >
      {card.image && (
        // 모바일: 고정 높이 h-24로 더 컴팩트 / 데스크탑: 4:3 비율
        <div className="relative w-full h-24 sm:h-auto sm:aspect-[4/3] bg-white">
          <Image
            src={card.image}
            alt={name}
            fill
            className="object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      )}
      <div className="p-2 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">{name}</h3>
        <p className="mt-0.5 text-xs sm:text-sm text-gray-600 [&_a]:no-underline [&_a]:text-teal-600 [&_a:hover]:underline">
        {summary}
        </p>
        <p className="mt-2 text-[11px] sm:text-xs text-teal-600 font-medium">{t('mapLink')}</p>
      </div>
    </a>
  );
}

// ----------------------------
// (shopping-6) SectionBlock — 모바일 2열 그리드
// ----------------------------
function SectionBlock({ id, title, description, children }: { id: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-2">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-gray-600 text-sm sm:text-base">{description}</p>}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}

// ----------------------------
// (shopping-7) 페이지 컴포넌트
// ----------------------------
export default async function ShoppingGuidePage({ params: { locale } }: Props) {
  const t = await getTranslations('vancouver.ShoppingGuide');

  const byCategory = initialCards.reduce<Record<StoreCard['category'], StoreCard[]>>(
    (acc, item) => {
      acc[item.category].push(item);
      return acc;
    },
    { supermarket: [], electronics: [], household: [], asian: [], convenience: [], online: [] }
  );

  return (
    <main className="bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* 뒤로가기 */}
        <div className="mb-4 sm:mb-6">
          <Link href={`/${locale}/vancouver/guides`} className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-teal-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToGuides')}
          </Link>
        </div>

        <article className="rounded-3xl bg-white/95 backdrop-blur p-6 sm:p-8 lg:p-12 shadow-lg ring-1 ring-gray-900/5">
          <header className="text-center">
            <h1 className="text-3xl sm:text-5xl pb-3 sm:pb-4 font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {t('pageTitle')}
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-lg text-gray-500">{t('subtitle')}</p>
            <div className="mt-4 sm:mt-5 flex flex-col items-center gap-2 text-xs sm:text-sm text-gray-600 sm:flex-row sm:justify-center">
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

          <hr className="my-6 sm:my-8 border-gray-200" />

          {/* 인트로 */}
          <section className="mt-6 sm:mt-8">
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-1.5 rounded-full bg-teal-500/80" />
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-teal-700">
                    <ShieldAlert className="h-4 w-4" />
                    Intro
                  </div>
                  <p className="text-[0.98rem] sm:text-lg leading-7 sm:leading-8 text-gray-700">{t('intro')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* TOC */}
          <section className="mt-6 sm:mt-8">
            <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">{t('toc.title')}</h2>
            <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {toc(t).map((item) => (
                <a key={item.id} href={`#${item.id}`} className="group inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs sm:text-sm text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow">
                  <item.icon className="h-4 w-4 text-teal-600 transition group-hover:scale-110" />
                  <span className="truncate">{item.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* 본문 섹션들 */}
          <div className="prose prose-base sm:prose-lg max-w-none text-gray-700 leading-relaxed">
            <SectionBlock id="supermarkets" title={t('sections.supermarkets.title')} description={t('sections.supermarkets.desc')}>
              {byCategory.supermarket.map((card) => (
                <MiniCard key={card.slug} card={card} t={t} />
              ))}
            </SectionBlock>

            <SectionBlock id="electronics" title={t('sections.electronics.title')} description={t('sections.electronics.desc')}>
              {byCategory.electronics.map((card) => (
                <MiniCard key={card.slug} card={card} t={t} />
              ))}
            </SectionBlock>

            <SectionBlock id="household" title={t('sections.household.title')} description={t('sections.household.desc')}>
              {byCategory.household.map((card) => (
                <MiniCard key={card.slug} card={card} t={t} />
              ))}
            </SectionBlock>

            <SectionBlock id="asian" title={t('sections.asian.title')} description={t('sections.asian.desc')}>
              {byCategory.asian.map((card) => (
                <MiniCard key={card.slug} card={card} t={t} />
              ))}
            </SectionBlock>

            <SectionBlock id="convenience" title={t('sections.convenience.title')} description={t('sections.convenience.desc')}>
              {byCategory.convenience.map((card) => (
                <MiniCard key={card.slug} card={card} t={t} />
              ))}
            </SectionBlock>

            <SectionBlock id="online" title={t('sections.online.title')} description={t('sections.online.desc')}>
              {byCategory.online.length > 0 ? (
                byCategory.online.map((card) => <MiniCard key={card.slug} card={card} t={t} />)
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">{t('sections.online.placeholder')}</p>
              )}
            </SectionBlock>
          </div>

          {/* 하단 CTA */}
          <div className="not-prose mt-10 sm:mt-12 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
            <Link href={`/${locale}/vancouver/guides/housing`} aria-label={t('nextGuides.life')} className="no-underline group flex items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors hover:border-teal-300 hover:bg-teal-50/60">
              <span className="inline-flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-100">
                  <MapPin className="h-4 w-4 text-teal-700" />
                </span>
                {t('nextGuides.housing')}
              </span>
              <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link href={`/${locale}/vancouver/guides/work-finance`} aria-label={t('nextGuides.workFinance')} className="no-underline group flex items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors hover:border-teal-300 hover:bg-teal-50/60">
              <span className="inline-flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-100">
                  <BadgePercent className="h-4 w-4 text-teal-700" />
                </span>
                {t('nextGuides.workFinance')}
              </span>
              <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

// ----------------------------
// (shopping-8) 번역키 가이드 (주석)
// ----------------------------
// vancouver.ShoppingGuide.stores.iga.name
// vancouver.ShoppingGuide.stores.iga.summary
// vancouver.ShoppingGuide.stores.noFrills.name
// vancouver.ShoppingGuide.stores.noFrills.summary
// vancouver.ShoppingGuide.stores.safeWay.name
// vancouver.ShoppingGuide.stores.safeWay.summary
// vancouver.ShoppingGuide.stores.hMart.name
// vancouver.ShoppingGuide.stores.hMart.summary
// vancouver.ShoppingGuide.stores.hannamMart.name
// vancouver.ShoppingGuide.stores.hannamMart.summary
// vancouver.ShoppingGuide.stores.tAndT.name
// vancouver.ShoppingGuide.stores.tAndT.summary
// vancouver.ShoppingGuide.stores.konbiniya.name
// vancouver.ShoppingGuide.stores.konbiniya.summary
// vancouver.ShoppingGuide.stores.sevenEleven.name
// vancouver.ShoppingGuide.stores.sevenEleven.summary
// vancouver.ShoppingGuide.stores.bestBuy.name
// vancouver.ShoppingGuide.stores.bestBuy.summary
// vancouver.ShoppingGuide.stores.londonDrugs.name
// vancouver.ShoppingGuide.stores.londonDrugs.summary
// vancouver.ShoppingGuide.stores.shoppersDrug.name
// vancouver.ShoppingGuide.stores.shoppersDrug.summary
