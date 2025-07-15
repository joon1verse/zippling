// app/[locale]/page-communitysection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import VisitorChart from './page-visitorchart';
import WaveSeparator from './WaveSeparator'; // [수정] WaveSeparator를 import합니다.
import styles from '../assets/css/animations.module.css';

type CommunityDataProps = {
    dailyVisitors: any[];
    totalUsers: number;
    totalVisitors: number;
    currentTestimonial: any;
};

export default function CommunitySectionClient({ dailyVisitors, totalUsers, totalVisitors, currentTestimonial }: CommunityDataProps) {
  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    // [수정] HeroSection보다 1초 늦게 애니메이션이 시작되도록 지연 시간을 1100ms로 변경합니다.
    const timer = setTimeout(() => setVisible(true), 800); 
    return () => clearTimeout(timer);
  }, []);

  return (
    // [수정] WaveSeparator와 Community Section이 함께 애니메이션되도록 구조를 잡습니다.
    <div className={isVisible ? styles.fadeInUp : styles.opacity0}>
      <WaveSeparator className="fill-gray-50" />
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
              Zippling은 당신의 목소리에 귀 기울입니다
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              사용자 여러분의 소중한 피드백과 요청을 바탕으로 Zippling은{' '}
              <span className="font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                매일 더 나은 서비스
              </span>
              를 만들어갑니다. 저희는 일방적인 정보 제공을 넘어, 여러분과 함께 성장하는 커뮤니티를 지향합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-600">총 가입자 수</h3>
                  <p className="text-4xl font-extrabold text-teal-600 mt-2">
                    {totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-600">총 누적 방문자</h3>
                  <p className="text-4xl font-extrabold text-cyan-600 mt-2">
                    {totalVisitors.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center sm:text-left">최근 방문자 트렌드</h3>
                <div className="h-48 sm:h-56">
                  {dailyVisitors && dailyVisitors.length > 0 ? (
                    <VisitorChart data={dailyVisitors.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">방문자 데이터가 없습니다.</div>
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
                  <h3 className="mt-4 font-semibold text-gray-700">첫 후기를 기다립니다</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    여러분의 소중한 경험이<br />Zippling의 큰 자산이 됩니다.
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