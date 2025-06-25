// app/[locale]/hot-deal/write/page.tsx
import { Suspense } from "react";
import WriteForm from "./WriteForm";

// Next.js 14 App Router: useSearchParams 등 훅을 사용하는 컴포넌트는 반드시 Suspense로 감싸야 함!
export default function WritePage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <WriteForm />
    </Suspense>
  );
}
