// app/[locale]/page-community.tsx

// 'lucide-react'가 설치되어 있어야 아이콘이 보입니다.
// npm install lucide-react
import { Star } from 'lucide-react';

// CommunitySection 컴포넌트를 정의합니다.
export default function CommunitySection() {
  
  // 1. UI 확인을 위한 하드코딩 데이터
  const communityData = {
    totalVisitors: '1,680',
    title: 'Zippling은 당신의 목소리에 귀 기울입니다',
    description: '사용자 여러분의 소중한 피드백과 요청을 바탕으로 Zippling은 매일 더 나은 서비스를 만들어갑니다. 저희는 일방적인 정보 제공을 넘어, 여러분과 함께 성장하는 커뮤니티를 지향합니다.',
  };

  const testimonialsData = [
    {
      id: 1,
      user_nickname: '김민준',
      nationality: 'Seoul, South Korea',
      rating: 5,
      content: '낯선 곳에서 집 구하는 게 막막했는데, Zippling 덕분에 좋은 홈스테이를 구할 수 있었어요. 담당자분도 친절해서 정말 좋았습니다.',
      avatar_url: '/images/avatars/user-1.jpg', // 예시 경로, 실제 이미지 경로로 변경 필요
    },
    // 캐러셀 구현 시 여기에 데이터를 추가합니다.
  ];

  // 현재 보여줄 후기 (UI 확인용)
  const currentTestimonial = testimonialsData[0];

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 데스크톱에서는 2열, 모바일에서는 1열 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* 좌측: 활성화 지표 및 메시지 */}
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
              {communityData.title}
            </h2>
            <p className="text-lg text-gray-600">
              {communityData.description}
            </p>
            <div className="inline-block bg-white p-6 rounded-lg shadow-md">
              <div className="text-base font-semibold text-gray-700">
                누적 방문자
              </div>
              <div className="text-4xl font-extrabold text-teal-600 mt-1">
                {communityData.totalVisitors}+
              </div>
            </div>
          </div>

          {/* 우측: 후기 (실제로는 캐러셀 컴포넌트가 될 영역) */}
          <div className="min-h-[300px] flex items-center justify-center">
            {/* [개발 참고]
              실제 상호작용을 위해서는 이 부분을 별도의 클라이언트 컴포넌트('use client')로 만들고,
              Swiper.js 같은 라이브러리를 사용하여 캐러셀을 구현해야 합니다.
            */}
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
              <div className="flex items-center mb-4">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 leading-relaxed italic">
                "{currentTestimonial.content}"
              </blockquote>
              <figcaption className="mt-6 flex items-center">
                <img 
                  className="w-12 h-12 rounded-full object-cover" 
                  src={currentTestimonial.avatar_url} 
                  alt={`${currentTestimonial.user_nickname} 님`}
                />
                <div className="ml-4">
                  <div className="font-bold text-gray-900">{currentTestimonial.user_nickname}</div>
                  <div className="text-sm text-gray-500">{currentTestimonial.nationality}</div>
                </div>
              </figcaption>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}