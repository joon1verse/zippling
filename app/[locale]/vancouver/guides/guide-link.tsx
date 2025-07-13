// app/[locale]/vancouver/guides/guide-link.tsx
'use server'; // 이 컴포넌트는 서버에서만 렌더링되므로 명시해주는 것이 좋습니다.

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface GuideLinkProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  locale: string;
}

const GuideLink: React.FC<GuideLinkProps> = ({ href, icon: Icon, title, description, locale }) => {
  return (
    <Link
      href={`/${locale}${href}`}
      className="group block bg-white p-6 border border-gray-200/80 rounded-xl shadow-sm transition-all duration-300 hover:border-teal-400 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-teal-100/70 p-3 rounded-full mr-5">
          <Icon className="w-6 h-6 text-teal-700" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-teal-500 ml-4" />
      </div>
    </Link>
  );
};

export default GuideLink;