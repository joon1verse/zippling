'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Pencil, Trash2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Database } from '@server/types';
import type { User } from '@supabase/supabase-js';
import { deletePostAction, addCommentAction, deleteCommentAction, handleVoteAction } from './actions';

// 타입 정의
type CommunityPost = Database['public']['Tables']['vancouver_community']['Row'];
type CommunityComment = Database['public']['Tables']['vancouver_community_comments']['Row'];

// Props 타입 정의
interface Props {
  post: CommunityPost;
  safeContent: string;
  initialComments: CommunityComment[];
  currentUser: User | null;
  initialUserVote: 'up' | 'down' | null;
  locale: string;
}

export default function CommunityInteractions({
  post,
  safeContent,
  initialComments,
  currentUser,
  initialUserVote,
  locale,
}: Props) {
  // [수정] 'vancouver' 네임스페이스를 사용합니다.
  const t = useTranslations('vancouver');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [votes, setVotes] = useState({ upvotes: post.upvotes, downvotes: post.downvotes });
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true) }, []);

  const isAuthor = post.user_id === currentUser?.id;

  const handleCommentSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await addCommentAction(formData);
      if (result?.error) {
        // [수정] JSON 파일의 전체 경로로 키값에 접근합니다.
        alert(t('CommunityPage.PostPage.commentError'));
      } else {
        setNewComment('');
      }
    });
  };

  const handleVote = (voteType: 'up' | 'down') => {
    if (!currentUser) {
      alert(t('CommunityPage.PostPage.loginToVote'));
      return;
    }
    startTransition(async () => {
      const result = await handleVoteAction(post.id, voteType);
      if (result?.error) {
        alert(t('CommunityPage.PostPage.voteError'));
      } else if (result?.data) {
        setVotes({ upvotes: result.data.upvotes, downvotes: result.data.downvotes });
        setUserVote(userVote === voteType ? null : voteType);
      }
    });
  };

  const handleDeletePost = () => {
    if (window.confirm(t('CommunityPage.PostPage.deleteConfirm'))) {
      startTransition(async () => {
        const result = await deletePostAction(post.id, locale);
        if (result?.error) {
          alert(t('CommunityPage.PostPage.deleteError'));
        }
      });
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm(t('CommunityPage.PostPage.deleteCommentConfirm'))) {
      startTransition(async () => {
        const result = await deleteCommentAction(commentId, post.id);
        if (result?.error) {
          alert(t('CommunityPage.PostPage.deleteCommentError'));
        } else {
          setComments(comments.filter(c => c.id !== commentId));
        }
      });
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-screen-lg mx-auto">
        <div className="mb-4">
          <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1.5" />
            {t('CommunityPage.PostPage.backToList')}
          </button>
        </div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <article className="p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">{post.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 mb-6">
              <div>
                <span>{t('CommunityPage.PostPage.by')} {post.user_nickname || t('CommunityPage.anonymous')}</span>
                <span className="mx-1.5">·</span>
                <time dateTime={post.created_at}>{isClient ? new Date(post.created_at).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' }) : ''}</time>
              </div>
              {isAuthor && (
                <div className="flex items-center gap-4">
                  <button onClick={() => router.push(`/${locale}/vancouver/community/write?id=${post.id}`)} className="flex items-center gap-1 text-gray-500 hover:text-teal-600"><Pencil size={14} /><span>{t('CommunityPage.PostPage.edit')}</span></button>
                  <button onClick={handleDeletePost} disabled={isPending} className="flex items-center gap-1 text-gray-500 hover:text-red-600"><Trash2 size={14} /><span>{t('CommunityPage.PostPage.delete')}</span></button>
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-300" />
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeContent }} />
            
            <div className="mt-8 pt-4 border-t flex items-center justify-center gap-6">
              <button onClick={() => handleVote('up')} disabled={isPending} className={`flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors disabled:cursor-not-allowed ${userVote === 'up' ? 'text-green-600 font-bold' : ''}`}>
                <ThumbsUp size={20} className={`${userVote === 'up' ? 'fill-current' : ''}`} /> <span className="text-base">{votes.upvotes}</span>
              </button>
              <button onClick={() => handleVote('down')} disabled={isPending} className={`flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors disabled:cursor-not-allowed ${userVote === 'down' ? 'text-red-600 font-bold' : ''}`}>
                <ThumbsDown size={20} className={`${userVote === 'down' ? 'fill-current' : ''}`} /> <span className="text-base">{votes.downvotes}</span>
              </button>
            </div>
          </article>

          <section className="bg-gray-50/70 px-6 sm:px-8 py-4 border-t border-gray-200">
            <h2 className="text-base font-bold mb-4">{t('CommunityPage.PostPage.commentsTitle')} ({comments.length})</h2>
            {currentUser ? (
              <form action={handleCommentSubmit} className="flex gap-3 mb-6 items-start">
                <input type="hidden" name="postId" value={post.id} />
                <textarea name="content" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t('CommunityPage.PostPage.commentPlaceholder')} className="flex-grow border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none" rows={3} required/>
                <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 disabled:bg-gray-400" disabled={!newComment.trim() || isPending} aria-label="Submit comment"><Send size={20} /></button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 mb-6 text-center bg-gray-100 p-4 rounded-md">{t('CommunityPage.PostPage.loginToComment')}</p>
            )}
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-xs text-gray-800">{comment.user_nickname || t('CommunityPage.anonymous')}</span>
                        <time className="text-xs text-gray-400 ml-2">{isClient ? new Date(comment.created_at).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : ''}</time>
                      </div>
                      {(comment.user_id === currentUser?.id) && (<button onClick={() => handleDeleteComment(comment.id)} disabled={isPending} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>)}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-center text-gray-400 py-4">{t('CommunityPage.PostPage.noComments')}</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}