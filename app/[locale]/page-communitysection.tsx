// app/[locale]/page-communitysection.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Star } from 'lucide-react';
import VisitorChart from './page-visitorchart';
import WaveSeparator from './WaveSeparator';
import styles from '../assets/css/animations.module.css';

// [수정 1] description 관련 타입을 텍스트 조각들로 변경
type CommunityDataProps = {
    translations: {
        title: string;
        descriptionPart1: string;
        highlightText: string;
        descriptionPart2: string;
        totalUsersCardTitle: string;
        todayVisitorsCardTitle: string;
        cumulativeGraphTitle: string;
        noVisitorDataText: string;
        testimonialCardTitle: string;
        testimonialCardDescription: ReactNode;
    };
    cumulativeVisitorData: any[];
    totalUsers: number;
    latestDailyVisitors: number;
    currentTestimonial: any;
    graphLabel: string;
};

export default function CommunitySectionClient({ translations, cumulativeVisitorData, totalUsers, latestDailyVisitors, currentTestimonial, graphLabel }: CommunityDataProps) {
  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1100); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={isVisible ? styles.fadeInUp : styles.opacity0}>
      <WaveSeparator className="fill-gray-50" />
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
              {translations.title}
            </h2>
            {/* [수정 2] 전달받은 텍스트 조각들을 조합하여 렌더링 */}
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              {translations.descriptionPart1}
              <span className="font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                {translations.highlightText}
              </span>
              {translations.descriptionPart2}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-600">{translations.totalUsersCardTitle}</h3>
                  <p className="text-4xl font-extrabold text-teal-600 mt-2">
                    {totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-600">{translations.todayVisitorsCardTitle}</h3>
                  <p className="text-4xl font-extrabold text-indigo-600 mt-2">
                    {latestDailyVisitors.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center sm:text-left">{translations.cumulativeGraphTitle}</h3>
                <div className="h-48 sm:h-56">
                {cumulativeVisitorData && cumulativeVisitorData.length > 0 ? (
            // [수정 2] VisitorChart에 graphLabel을 dataKey로 전달합니다.
            <VisitorChart data={cumulativeVisitorData} dataKey={graphLabel} />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">{translations.noVisitorDataText}</div>
          )}
        </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              {currentTestimonial ? (
                <div>
                  <div className="flex items-center mb-4">
                    {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed italic text-lg">
                    "{currentTestimonial.content}"
                  </blockquote>
                  <figcaption className="mt-6 flex items-center">
                    <img 
                      className="w-14 h-14 rounded-full object-cover bg-gray-200" 
                      src={currentTestimonial.user_profiles?.avatar_url || '/images/avatars/default.png'} 
                      alt={`${currentTestimonial.user_profiles?.user_nickname} 님`}
                    />
                    <div className="ml-4">
                      <div className="font-bold text-gray-900">{currentTestimonial.user_profiles?.user_nickname}</div>
                      <div className="text-sm text-gray-500">{currentTestimonial.user_profiles?.nationality}</div>
                    </div>
                  </figcaption>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <Star className="w-12 h-12 text-gray-300" />
                  <h3 className="mt-4 font-semibold text-gray-700">{translations.testimonialCardTitle}</h3>
                  {/* [수정 2] dangerouslySetInnerHTML 대신, ReactNode를 직접 렌더링합니다. */}
                  <p className="mt-2 text-sm text-gray-500">
                    {translations.testimonialCardDescription}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}