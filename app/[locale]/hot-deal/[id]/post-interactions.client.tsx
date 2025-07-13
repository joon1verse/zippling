'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Database } from '@server/types';
import type { User } from '@supabase/supabase-js';
import { addCommentAction, deleteCommentAction, deletePostAction, handleVoteAction } from './actions';

// 타입 정의
type HotDealPost = Database['public']['Tables']['hot_deal_posts']['Row'];
type HotDealComment = Database['public']['Tables']['hot_deal_comments']['Row'];

// Prop 타입 정의
interface PostInteractionsProps {
  post: HotDealPost;
  safeContent: string;
  initialComments: HotDealComment[];
  currentUser: User | null;
  userVote: 'up' | 'down' | null;
  isAuthor: boolean;
  isAdmin: boolean;
  locale: string;
}

export default function PostInteractions({
  post,
  safeContent,
  initialComments,
  currentUser,
  userVote: initialUserVote,
  isAuthor,
  isAdmin,
  locale,
}: PostInteractionsProps) {
  const t = useTranslations('HotDealPage.detail');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // 이 컴포넌트 내부에서 관리될 상태
  const [comments, setComments] = useState(initialComments);
  const [votes, setVotes] = useState({ upvotes: post.upvotes, downvotes: post.downvotes });
  const [userVote, setUserVote] = useState(initialUserVote);

  // Hydration 오류 방지를 위한 클라이언트 렌더링 상태
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 댓글 폼 제출 핸들러
  const handleCommentSubmit = async (formData: FormData) => {
    if (!currentUser) return;

    const tempId = Date.now();
    const content = formData.get('content') as string;
    
    // Optimistic UI: 사용자 닉네임은 서버에서 처리하므로 여기서는 null로 둡니다.
    // 서버 액션에서 user_id를 통해 최신 닉네임을 가져와 저장합니다.
    setComments(prev => [
      ...prev,
      {
        id: tempId,
        content: content,
        created_at: new Date().toISOString(),
        post_id: post.id,
        user_id: currentUser.id,
        user_nickname: '...', // 임시 닉네임
      },
    ]);
    formRef.current?.reset();

    const result = await addCommentAction(formData);
    if (!result.success) {
      alert(t('commentError'));
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };
  
  // 추천/비추천 핸들러
  const handleVote = (voteType: 'up' | 'down') => {
    if (!currentUser) {
      alert(t('loginToVote'));
      return;
    }
    startTransition(async () => {
      const result = await handleVoteAction(post.id, voteType, locale);
      if (result.success && result.data) {
        setVotes({ upvotes: result.data.upvotes, downvotes: result.data.downvotes });
        setUserVote(userVote === voteType ? null : voteType);
      }
    });
  };

  // 게시글 삭제 핸들러
  const handleDeletePost = () => {
    if (!window.confirm(t('deleteConfirm'))) return;
    startTransition(async () => {
      await deletePostAction(post.id, locale);
    });
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    if (!window.confirm(t('deleteCommentConfirm'))) return;
    startTransition(async () => {
      await deleteCommentAction(commentId, locale, post.id);
      setComments(prev => prev.filter(c => c.id !== commentId));
    });
  };

  return (
    <div className="bg-white">
      <article className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 mb-6">
          <div>
            <span>{t('by')} {post.user_nickname || t('anonymous')}</span>
            <span className="mx-1.5">·</span>
            <time dateTime={post.created_at}>
              {isClient 
                ? new Date(post.created_at).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })
                : new Date(post.created_at).toLocaleDateString(locale)
              }
            </time>
          </div>
          {(isAuthor || isAdmin) && (
            <div className="flex items-center gap-4">
              <button onClick={() => router.push(`/${locale}/hot-deal/write?id=${post.id}`)} className="flex items-center gap-1 text-gray-500 hover:text-teal-600"><Pencil size={14} /><span>{t('edit')}</span></button>
              <button onClick={handleDeletePost} disabled={isPending} className="flex items-center gap-1 text-gray-500 hover:text-red-600 disabled:opacity-50"><Trash2 size={14} /><span>{t('delete')}</span></button>
            </div>
          )}
        </div>
        <hr className="my-6 border-gray-200" />
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeContent }} />
        <div className="mt-8 pt-4 border-t flex items-center justify-center gap-6">
          <button onClick={() => handleVote('up')} disabled={isPending} className={`flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors disabled:cursor-not-allowed ${userVote === 'up' ? 'text-green-600 font-bold' : ''}`}><ThumbsUp size={20} className={`${userVote === 'up' ? 'fill-current' : ''}`} /><span className="text-base">{votes.upvotes}</span></button>
          <button onClick={() => handleVote('down')} disabled={isPending} className={`flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors disabled:cursor-not-allowed ${userVote === 'down' ? 'text-red-600 font-bold' : ''}`}><ThumbsDown size={20} className={`${userVote === 'down' ? 'fill-current' : ''}`} /><span className="text-base">{votes.downvotes}</span></button>
        </div>
      </article>
      <section className="bg-gray-50/70 px-6 sm:px-8 py-4 border-t border-gray-200">
        <h2 className="text-base font-bold mb-4">{t('commentsTitle')} ({comments.length})</h2>
        {currentUser ? (
          <form ref={formRef} action={handleCommentSubmit} className="flex gap-3 mb-6 items-start">
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="locale" value={locale} />
            <textarea name="content" placeholder={t('commentPlaceholder')} className="flex-grow border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none" rows={3} required />
            <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0" disabled={isPending} aria-label="Submit comment"><Send size={20} /></button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-6 text-center bg-gray-100 p-4 rounded-md">{t('loginToComment')}</p>
        )}
        <div className="space-y-3">
          {comments.map(comment => {
            const formattedDate = isClient 
                ? new Date(comment.created_at).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
                : new Date(comment.created_at).toLocaleDateString(locale);

            return (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-xs text-gray-800">{comment.user_nickname || t('anonymous')}</span>
                      <time className="text-xs text-gray-400 ml-2">{formattedDate}</time>
                    </div>
                    {(comment.user_id === currentUser?.id || isAdmin) && (
                      <button onClick={() => handleDeleteComment(comment.id)} disabled={isPending} className="text-gray-400 hover:text-red-500 disabled:opacity-50"><Trash2 size={13} /></button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                </div>
              </div>
            );
          })}
          {comments.length === 0 && <p className="text-sm text-center text-gray-400 py-4">{t('noComments')}</p>}
        </div>
      </section>
    </div>
  );
}