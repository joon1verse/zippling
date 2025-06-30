// app/[locale]/hot-deal/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@server/supabaseProvider';
import type { Database } from '@server/types';
import type { User } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
// 1. useTranslations 훅을 가져옵니다.
import { useTranslations } from 'next-intl';

type HotDealPost = Database['public']['Tables']['hot_deal_posts']['Row'];

export default function HotDealDetailPage() {
  const { id, locale } = useParams() as { id: string; locale: string };
  const router = useRouter();
  const supabase = useSupabaseClient();
  // 2. 'hotdeal.detail' 네임스페이스를 사용하도록 설정합니다.
  const t = useTranslations('hotdeal.detail');

  const [post, setPost] = useState<HotDealPost | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPostAndUser = async () => {
      const { data: postData } = await supabase
        .from('hot_deal_posts')
        .select('*')
        .eq('id', Number(id))
        .single();
      setPost(postData);

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchPostAndUser();
  }, [id, supabase]);

  useEffect(() => {
    if (post && currentUser) {
      setIsAuthor(post.user_id === currentUser.id);
    }
  }, [post, currentUser]);

  const handleEdit = () => {
    router.push(`/${locale}/hot-deal/write?id=${id}`);
  };

  const handleDelete = async () => {
    // 3. 하드코딩된 텍스트를 번역 키로 교체합니다.
    if (!post || !window.confirm(t('deleteConfirm'))) {
      return;
    }
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('hot_deal_posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      console.error('Failed to delete post:', error);
      alert(t('deleteError'));
      setIsDeleting(false);
    } else {
      router.push(`/${locale}/hot-deal`);
    }
  };

  const getSafeCurrencyCode = (code: string | null): string => {
    if (!code) return 'CAD';
    if (code === 'CA$') return 'CAD';
    if (code === 'US$') return 'USD';
    return code;
  };

  if (!post) {
    // 3. 하드코딩된 텍스트를 번역 키로 교체합니다.
    return <p className="py-20 text-center text-gray-500">{t('loading')}</p>;
  }

  const safeContent = DOMPurify.sanitize(post.content || '');

  return (
    <div className="bg-gray-50 min-h-screen py-12 sm:py-8 px-4 sm:px-8">
      <div className="">
        <div className="mb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1.5" />
            {t('backToList')}
          </button>
        </div>

        <article className="bg-white shadow-lg rounded-lg p-8 sm:p-12 md:p-16 min-h-[70vh]">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900 leading-tight">
            {post.title}
          </h1>
          {post.price != null && (
            <p className="text-2xl lg:text-3xl font-bold text-teal-600 mb-4">
              {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: getSafeCurrencyCode(post.currency_type),
                minimumFractionDigits: 0
              }).format(post.price)}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-gray-500 mb-8">
            <div>
              <span>{t('by')} {post.user_nickname || t('anonymous')}</span>
              <span className="mx-1.5">·</span>
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-x-4">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-x-1 text-gray-500 hover:text-teal-600 font-medium transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{t('edit')}</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-x-1 text-gray-500 hover:text-red-600 font-medium transition-colors disabled:text-gray-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? t('deleting') : t('delete')}</span>
                </button>
              </div>
            )}
          </div>

          <hr className="border-gray-200 mb-8" />
          <div
            className="prose prose-lg max-w-none leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        </article>
      </div>
    </div>
  );
}
