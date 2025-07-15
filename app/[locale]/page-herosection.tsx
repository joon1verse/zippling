// app/[locale]/page-herosection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import HeroButtons from './HeroButtons';
import styles from '../assets/css/animations.module.css';

type HeroContentProps = {
  t: {
    heroSlogan: string;
    heroDescription: string;
    promoTagline: string;
    promoTitle: string;
    promoDescription: string;
  };
};

export default function HeroSection({ t }: HeroContentProps) {
  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    // [수정] 애니메이션 클래스를 'reveal'에서 'fadeInUp'으로 변경합니다.
    <div className={isVisible ? styles.fadeInUp : styles.opacity0}>
      {/* ✨ ZIPPLING 브랜딩 및 메인 슬로건 섹션 */}
      <section className="text-center px-4 pt-10 pb-8 bg-gradient-to-b from-white to-gray-50">
        <h1 
          className={`text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent ${styles.backgroundPan}`}
          style={{ textShadow: '0 2px 10px rgba(45, 212, 191, 0.2)' }}
        >
          ZIPPLING
        </h1>
        <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl mt-4 mb-4 break-words">
            {t.heroSlogan}
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed break-words">
          {t.heroDescription}
        </p>
      </section>

      {/* 🏙️ 2단 그리드 레이아웃의 히어로 섹션 */}
      <section className="py-12 sm:py-16 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-center lg:text-left order-last lg:order-first">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-4 text-base font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                <Sparkles className={`w-5 h-5 text-teal-500 ${styles.sparkle}`} />
                <span>{t.promoTagline}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5 break-words">
                {t.promoTitle}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed break-words">
                {t.promoDescription}
              </p>
              <div>
                <HeroButtons /> 
              </div>
            </div>

            <div className={`relative w-full h-80 sm:h-96 lg:h-full min-h-[320px] order-first lg:order-last transition-transform duration-500 ease-out ${isVisible ? 'scale-100' : 'scale-95'}`}>
                <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl shadow-gray-300/40"></div>
                <div className="absolute inset-4 overflow-hidden rounded-xl shadow-lg">
                    <Image
                        src="/images/vancouver_main.jpg"
                        alt="Vancouver Cityscape"
                        fill
                        priority
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}