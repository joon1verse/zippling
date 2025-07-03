/*
 * 파일 2: header.tsx (신규 추가 및 수정)
 * * [수정 사항]
 * - usePathname 훅을 사용하여 현재 경로를 가져옵니다.
 * - 언어 변경 시, 현재 경로를 유지한 채로 locale만 변경하여 이동하도록 수정합니다.
 */
'use client'; 

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

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
  const pathname = usePathname(); // 현재 경로를 가져옵니다.
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' }
  ];

  const currentLang = languages.find(l => l.code === currentLocale);

  const handleLocaleChange = (newLocale: string) => {
    // 현재 경로에서 locale 부분을 제거합니다. 예: /ko/about -> /about
    const pathWithoutLocale = pathname.startsWith(`/${currentLocale}`)
      ? pathname.substring(currentLocale.length + 1)
      : pathname;
    
    // 새로운 locale과 나머지 경로를 조합하여 새 URL을 만듭니다.
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