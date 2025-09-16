// app/[locale]/vancouver/guides/guide-link.tsx
'use server';

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
      // [수정] h-full로 그리드 셀 높이를 꽉 채우게 하고, flex-col로 내부 정렬 안정화
      className="group block h-full bg-white p-6 border border-gray-200/80 rounded-xl shadow-sm transition-all duration-300 hover:border-teal-400 hover:shadow-lg hover:-translate-y-1"
    >
      {/* [수정] 내부를 flex로 만들어 아래쪽 화살표 아이콘까지 수직 정렬 여유 확보 */}
      <div className="flex h-full">
        <div className="flex-shrink-0 bg-teal-100/70 p-3 rounded-full mr-5 self-start">
          <Icon className="w-6 h-6 text-teal-700" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-teal-500 ml-4 self-center" />
      </div>
    </Link>
  );
};

export default GuideLink;
