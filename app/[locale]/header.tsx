/*
 * 파일: header.tsx
 * [수정 사항]
 * - LanguageDropdown 컴포넌트가 하드코딩된 언어 이름 대신,
 * useTranslations 훅을 사용하여 common.json에서 동적으로 언어 이름을 가져오도록 수정합니다.
 */
'use client'; 

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl'; // [추가] useTranslations 훅을 import합니다.

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  return (
    <header className="relative top-0 z-50 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
      <div className="container mx-auto px-6 py-1 flex items-center justify-between">
        <Logo locale={locale} />
        <LanguageDropdown currentLocale={locale} />
      </div>
    </header>
  );
}

function Logo({ locale }: { locale: string }) {
  return (
    <Link href={`/${locale}`}>
      <div className="flex items-center cursor-pointer">
        <Image
          src="/images/zippling_logo_white.png"
          alt="Zippling Logo"
          width={48}
          height={48}
          priority
        />
        <span className="text-2xl font-bold">Zippling</span>
      </div>
    </Link>
  );
}

function LanguageDropdown({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  
  // [추가] 'Header.language' 네임스페이스를 사용하여 언어 번역을 가져옵니다.
  const t = useTranslations('common.Header.language');

  // [수정] 하드코딩된 label 대신 t() 함수를 사용하여 동적으로 언어 이름을 설정합니다.
  const languages = [
    { code: 'en', label: t('en'), flag: '🇬🇧' },
    { code: 'ko', label: t('ko'), flag: '🇰🇷' },
    { code: 'ja', label: t('ja'), flag: '🇯🇵' }
  ];

  const currentLang = languages.find(l => l.code === currentLocale);

  const handleLocaleChange = (newLocale: string) => {
    const pathWithoutLocale = pathname.startsWith(`/${currentLocale}`)
      ? pathname.substring(currentLocale.length + 1)
      : pathname;
    
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-white px-3 py-2 rounded hover:bg-white hover:text-teal-600 transition-colors"
      >
        <span>{currentLang?.flag}</span>
        <span>{currentLang?.label}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white text-gray-800 rounded shadow-md z-40">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLocaleChange(lang.code)}
              className={`block w-full text-left px-3 py-2 hover:bg-gray-100
                ${lang.code === currentLocale ? 'bg-gray-200 font-semibold' : ''}`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
