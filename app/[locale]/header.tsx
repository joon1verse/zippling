'use client'; // 클라이언트 컴포넌트이므로 여기서 선언

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Logo locale={locale} />
        <LanguageDropdown currentLocale={locale} />
      </div>
    </header>
  );
}

function Logo({ locale }: { locale: string }) {
  return (
    <Link href={`/${locale}`}>
      <div className="flex items-center gap-2 cursor-pointer">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2L2 8h3v8h10V8h3L10 2z" />
        </svg>
        <span className="text-2xl font-extrabold">Zippling</span>
      </div>
    </Link>
  );
}

function LanguageDropdown({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' }
  ];

  const currentLang = languages.find(l => l.code === currentLocale);

  const handleLocaleChange = (code: string) => {
    router.push(`/${code}`);
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
        <div className="absolute right-0 mt-2 w-32 bg-white text-gray-800 rounded shadow-md z-10">
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
