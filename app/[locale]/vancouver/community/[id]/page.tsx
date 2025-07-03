// app/[locale]/vancouver/community/[id]/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@server/supabaseProvider';
import type { Database } from '@server/types';
import type { User } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Pencil, Trash2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

type CommunityPost = Database['public']['Tables']['vancouver_community']['Row'];
type CommunityComment = Database['public']['Tables']['vancouver_community_comments']['Row'];

export default function CommunityDetailPage() {
  const { id, locale } = useParams() as { id: string; locale: string };
  const router = useRouter();
  const supabase = useSupabaseClient();
  const t = useTranslations('community.detail');

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoteLoading, setIsVoteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: postData } = await supabase.from('vancouver_community').select('*').eq('id', Number(id)).single();
      if (postData) {
        setPost(postData);
        setVotes({ upvotes: postData.upvotes, downvotes: postData.downvotes });
        setIsAuthor(postData.user_id === user?.id);
      }

      if (user && postData) {
        const { data: voteData } = await supabase.from('vancouver_community_votes').select('vote_type').eq('post_id', postData.id).eq('user_id', user.id).single();
        if (voteData) {
          setUserVote(voteData.vote_type as 'up' | 'down');
        }
      }

      const { data: commentsData } = await supabase.from('vancouver_community_comments').select('*').eq('post_id', Number(id)).order('created_at', { ascending: true });
      setComments(commentsData || []);
      setLoading(false);
    };
    fetchData();
  }, [id, supabase]);

  const handleDeletePost = async () => {
    if (!post || !window.confirm(t('deleteConfirm'))) return;
    const { error } = await supabase.from('vancouver_community').delete().eq('id', post.id);
    if (error) { alert(t('deleteError')); } else { router.push(`/${locale}/vancouver/community`); }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !post) return;
    const { data: profileData } = await supabase.from('user_profiles').select('user_nickname').eq('id', currentUser.id).single();
    const nickname = profileData?.user_nickname || t('anonymous');
    const { data: newCommentData, error } = await supabase.from('vancouver_community_comments').insert({ content: newComment, post_id: post.id, user_id: currentUser.id, user_nickname: nickname }).select().single();
    if (error) { alert(t('commentError')); } else if (newCommentData) { setComments([...comments, newCommentData]); setNewComment(''); }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm(t('deleteCommentConfirm'))) return;
    const { error } = await supabase.from('vancouver_community_comments').delete().eq('id', commentId);
    if (error) { alert(t('deleteCommentError')); } else { setComments(comments.filter(c => c.id !== commentId)); }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!currentUser) {
      alert(t('loginToVote'));
      return;
    }
    if (!post || isVoteLoading) return;
    setIsVoteLoading(true);
    const { data, error } = await supabase.rpc('handle_vote', { post_id_input: post.id, vote_type_input: voteType });
    if (error) {
      console.error('Error handling vote:', error);
      alert(t('voteError'));
    } else {
      setVotes({ upvotes: data.upvotes, downvotes: data.downvotes });
      setUserVote(userVote === voteType ? null : voteType);
    }
    setIsVoteLoading(false);
  };

  if (loading) {
    return <p className="py-20 text-center text-gray-500">{t('loading')}</p>;
  }
  if (!post) {
    return <p className="py-20 text-center text-gray-500">{t('postNotFound')}</p>;
  }

  const safeContent = DOMPurify.sanitize(post.content || '');

  return (
    // [수정됨] 페이지 전체를 감싸는 최상위 div를 main으로 변경하여 시맨틱 의미를 강화합니다.
    <main className="bg-gray-50 min-h-screen py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-screen-lg mx-auto">
        <div className="mb-4">
          <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1.5" />
            {t('backToList')}
          </button>
        </div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <article className="p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">{post.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 mb-6">
              <div>
                <span>{t('by')} {post.user_nickname || t('anonymous')}</span>
                <span className="mx-1.5">·</span>
                <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })}</time>
              </div>
              {isAuthor && (
                <div className="flex items-center gap-4">
                  <button onClick={() => router.push(`/${locale}/vancouver/community/write?id=${id}`)} className="flex items-center gap-1 text-gray-500 hover:text-teal-600"><Pencil size={14} /><span>{t('edit')}</span></button>
                  <button onClick={handleDeletePost} className="flex items-center gap-1 text-gray-500 hover:text-red-600"><Trash2 size={14} /><span>{t('delete')}</span></button>
                </div>
              )}
            </div>

            {/* [수정됨] 제목/정보와 본문 사이에 구분선을 추가합니다. */}
            <hr className="my-6 border-gray-300" />

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeContent }} />
            
            <div className="mt-8 pt-4 border-t flex items-center justify-center gap-6">
              <button onClick={() => handleVote('up')} disabled={isVoteLoading} className={`flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors disabled:cursor-not-allowed ${userVote === 'up' ? 'text-green-600 font-bold' : ''}`}>
                <ThumbsUp size={20} className={`${userVote === 'up' ? 'fill-current' : ''}`} />
                <span className="text-base">{votes.upvotes}</span>
              </button>
              <button onClick={() => handleVote('down')} disabled={isVoteLoading} className={`flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors disabled:cursor-not-allowed ${userVote === 'down' ? 'text-red-600 font-bold' : ''}`}>
                <ThumbsDown size={20} className={`${userVote === 'down' ? 'fill-current' : ''}`} />
                <span className="text-base">{votes.downvotes}</span>
              </button>
            </div>
          </article>

          <section className="bg-gray-50/70 px-6 sm:px-8 py-4 border-t border-gray-200">
            <h2 className="text-base font-bold mb-4">{t('commentsTitle')} ({comments.length})</h2>
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6 items-start">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t('commentPlaceholder')} className="flex-grow border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none" rows={3} />
                <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0" disabled={!newComment.trim()} aria-label="Submit comment"><Send size={20} /></button>
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
                      {comment.user_id === currentUser?.id && (<button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>)}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && !loading && <p className="text-sm text-center text-gray-400 py-4">{t('noComments')}</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
