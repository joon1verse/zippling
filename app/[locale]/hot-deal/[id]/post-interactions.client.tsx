/*
================================================================================
  2. 클라이언트 컴포넌트 (수정)
  파일 경로: app/[locale]/hot-deal/[id]/post-interactions.client.tsx
  (실시간 로그인 상태를 감지하도록 수정했습니다.)
================================================================================
*/
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Database } from '@server/types';
import type { User } from '@supabase/supabase-js';
import { addCommentAction, deleteCommentAction, deletePostAction, handleVoteAction } from './actions';
import { createBrowserSupabase } from '@server/supabaseBrowserClient'; // [추가] 브라우저용 Supabase 클라이언트

// 타입 정의
type HotDealPost = Database['public']['Tables']['hot_deal_posts']['Row'];
type HotDealComment = Database['public']['Tables']['hot_deal_comments']['Row'];

interface PostInteractionsProps {
  post: HotDealPost;
  initialComments: HotDealComment[];
  currentUser: User | null; // 서버에서 받은 초기 유저 정보
  userVote: 'up' | 'down' | null;
  isAuthor: boolean;
  isAdmin: boolean;
  locale: string;
}

export default function PostInteractions({
  post,
  initialComments,
  currentUser: serverUser, // [수정] prop 이름을 serverUser로 변경하여 명확화
  userVote: initialUserVote,
  isAuthor: serverIsAuthor, // [수정] prop 이름을 serverIsAuthor로 변경
  isAdmin: serverIsAdmin,   // [수정] prop 이름을 serverIsAdmin으로 변경
  locale,
}: PostInteractionsProps) {
  const t = useTranslations('HotDealPage.detail');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createBrowserSupabase(); // [추가]

  // [수정] 클라이언트에서 실시간으로 관리될 상태들
  const [comments, setComments] = useState(initialComments);
  const [votes, setVotes] = useState({ upvotes: post.upvotes, downvotes: post.downvotes });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [currentUser, setCurrentUser] = useState(serverUser);
  const [isAuthor, setIsAuthor] = useState(serverIsAuthor);
  const [isAdmin, setIsAdmin] = useState(serverIsAdmin);

  // [추가] 클라이언트에서 실시간으로 로그인 상태를 감지하고 UI를 업데이트하는 로직
  useEffect(() => {
    // onAuthStateChange는 컴포넌트가 로드될 때 현재 로그인 상태를 즉시 알려주고,
    // 이후 로그인/로그아웃 시에도 상태 변경을 감지하여 콜백 함수를 실행합니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      setIsAuthor(user?.id === post.user_id);

      // 관리자 여부도 실시간으로 재확인
      if (user) {
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, post.user_id]);
  
  // 댓글 폼 제출 핸들러
  const handleCommentSubmit = async (formData: FormData) => {
    // Optimistic UI를 위해 현재 로그인한 유저 정보가 반드시 필요합니다.
    if (!currentUser) return;

    const tempId = Date.now();
    const content = formData.get('content') as string;
    
    setComments(prev => [
      ...prev,
      {
        id: tempId,
        content: content,
        created_at: new Date().toISOString(),
        post_id: post.id,
        user_id: currentUser.id,
        user_nickname: (currentUser.user_metadata?.nickname as string) || t('anonymous'),
      },
    ]);
    formRef.current?.reset();

    const result = await addCommentAction(formData);
    if (!result.success) {
      alert(t('commentError'));
      setComments(prev => prev.filter(c => c.id !== tempId)); // 롤백
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
    startTransition(async () => {
      await deletePostAction(post.id, locale);
    });
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    startTransition(async () => {
      await deleteCommentAction(commentId, locale, post.id);
      setComments(prev => prev.filter(c => c.id !== commentId));
    });
  };

  const safeContent = DOMPurify.sanitize(post.content || '');

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <article className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 mb-6">
          <div>
            <span>{t('by')} {post.user_nickname || t('anonymous')}</span>
            <span className="mx-1.5">·</span>
            <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })}</time>
          </div>
          {(isAuthor || isAdmin) && (
            <div className="flex items-center gap-4">
              <button onClick={() => router.push(`/${locale}/hot-deal/write?id=${post.id}`)} className="flex items-center gap-1 text-gray-500 hover:text-teal-600"><Pencil size={14} /><span>{t('edit')}</span></button>
              <button onClick={handleDeletePost} disabled={isPending} className="flex items-center gap-1 text-gray-500 hover:text-red-600 disabled:opacity-50"><Trash2 size={14} /><span>{t('delete')}</span></button>
            </div>
          )}
        </div>
        <hr className="my-6 border-gray-300" />
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
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-3">
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-xs text-gray-800">{comment.user_nickname || t('anonymous')}</span>
                    <time className="text-xs text-gray-400 ml-2">{new Date(comment.created_at).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}</time>
                  </div>
                  {(comment.user_id === currentUser?.id || isAdmin) && (
                    <button onClick={() => handleDeleteComment(comment.id)} disabled={isPending} className="text-gray-400 hover:text-red-500 disabled:opacity-50"><Trash2 size={13} /></button>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-center text-gray-400 py-4">{t('noComments')}</p>}
        </div>
      </section>
    </div>
  );
}