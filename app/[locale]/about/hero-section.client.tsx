/*
================================================================================
  1. 새로운 클라이언트 컴포넌트 생성
  파일 경로: app/[locale]/about/hero-section.client.tsx
  (이 파일을 새로 생성해주세요.)
================================================================================
*/
'use client';

import Image from 'next/image';

// Hero 섹션에 필요한 데이터 타입을 정의합니다.
type HeroImage = {
  src: string;
  alt: string;
};

type HeroSectionProps = {
  headline: string;
  subheadline: string;
  images: HeroImage[];
};

// 'use client'를 선언하여 이 컴포넌트를 클라이언트 컴포넌트로 만듭니다.
export default function HeroSection({ headline, subheadline, images }: HeroSectionProps) {
  return (
    <>
      {/* styled-jsx는 클라이언트 컴포넌트 안에서 사용합니다. */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
      `}</style>

      <section className="relative w-full py-12 sm:py-10 md:py-14 lg:py-18 px-4 bg-gradient-to-br from-white to-gray-50 overflow-hidden flex flex-col items-center">
        <div className="text-center max-w-4xl mx-auto relative z-10 mb-10 sm:mb-12 md:mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            {headline}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed px-4">
            {subheadline}
          </p>
        </div>
        <div className="w-full relative z-0 py-6 bg-black text-center">
          <div className="overflow-hidden">
            <div className="flex flex-nowrap animate-scroll-left w-max items-center">
              {/* 무한 스크롤을 위해 이미지 세트를 두 번 렌더링합니다. */}
              {[...images, ...images].map((img, index) => (
                <div
                  key={index}
                  className="relative shadow-xl rounded-lg overflow-hidden flex-shrink-0 mx-3 sm:mx-4 md:mx-5"
                  style={{ width: '150px', height: '200px' }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={150}
                    height={200}
                    className="object-cover w-full h-full"
                    priority={index < images.length}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}