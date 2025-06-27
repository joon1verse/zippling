// app/[locale]/hot-deal/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabaseClient } from '@server/supabaseProvider';
import type { Database } from '@server/types';
// ① sanitize 라이브러리 import
import DOMPurify from 'dompurify';

type HotDealPost = Database['public']['Tables']['hot_deal_posts']['Row'];

export default function HotDealDetailPage() {
  const { id, locale } = useParams() as { id: string; locale: string };
  const supabase = useSupabaseClient();
  const [post, setPost] = useState<HotDealPost | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from('hot_deal_posts')
        .select('*')
        .eq('id', Number(id))
        .single();
      setPost(data);
    };
    fetchPost();
  }, [id, supabase]);

  if (!post) {
    return <p className="p-8 text-center text-gray-500">Loading...</p>;
  }

  // ② HTML sanitize
  const safeContent = DOMPurify.sanitize(post.content || '');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        by {post.user_nickname || 'Anonymous'}
      </p>

      {post.thumbnail_url && (
        <img
          src={post.thumbnail_url}
          alt="thumbnail"
          className="mb-4 w-full h-auto rounded"
        />
      )}

      {/* ③ sanitized HTML 렌더링 */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </div>
  );
}
