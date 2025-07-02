// app/[locale]/vancouver/community/write/page.tsx
import { Suspense } from "react";
import WriteForm from "./WriteForm";

// Next.js 14 App Router에서 useSearchParams 훅을 사용하는 컴포넌트는
// 반드시 Suspense로 감싸야 합니다.
export default function WriteCommunityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
      <WriteForm />
    </Suspense>
  );
}
