'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Mars, Venus, Info, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'; 
import type { Database } from '@server/types';
import { deleteRoomListingAction } from './actions';

type RoomPost = Database['public']['Tables']['vancouver_roomlistings']['Row'];

interface Props {
  initialListings: RoomPost[];
  totalPosts: number;
  isAdmin: boolean;
  locale: string;
}

const POSTS_PER_PAGE = 20;

export default function RoomListings({ initialListings, totalPosts, isAdmin, locale }: Props) {
  const t = useTranslations('vancouver.RoomPage');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const selectedRegions = searchParams.get('regions')?.split(',') || [];
  const selectedGenders = searchParams.get('genders')?.split(',') || [];

  const handleUrlChange = (params: URLSearchParams) => {
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    handleUrlChange(params);
  }, 300);

  const handleFilterToggle = (filterValue: string, filterType: 'regions' | 'genders') => {
    const params = new URLSearchParams(searchParams);
    const currentFilters = params.get(filterType)?.split(',') || [];
    const newFilters = currentFilters.includes(filterValue)
      ? currentFilters.filter(f => f !== filterValue)
      : [...currentFilters, filterValue];

    if (newFilters.length > 0) {
      params.set(filterType, newFilters.join(','));
    } else {
      params.delete(filterType);
    }
    handleUrlChange(params);
  };
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  const handleDelete = (postId: number) => {
    if (window.confirm(t('delete_confirmation'))) {
      startTransition(async () => {
        const result = await deleteRoomListingAction(postId, locale);
        if (result.success) {
          alert(t('delete_success'));
        } else {
          alert(t('delete_fail_with_reason', { reason: result.message }));
        }
      });
    }
  };

  const renderTime = (time: string | null) =>
    time ? formatDistanceToNow(new Date(time), { addSuffix: true }) : '';

  const renderGender = (tags: string[] | null) => {
    if (!tags) return null;
    if (tags.includes('female'))
      return <span className="flex items-center gap-1 text-pink-500 font-medium"><Venus className="w-3 h-3" />{t('sections.female')}</span>;
    if (tags.includes('male'))
      return <span className="flex items-center gap-1 text-blue-500 font-medium"><Mars className="w-3 h-3" />{t('sections.male')}</span>;
    return null;
  };

  const renderSourceTag = (tags: string[] | null) => {
    if (!tags) return '';
    if (tags.includes('korea')) return t('sections.korea');
    if (tags.includes('canada')) return t('sections.canada');
    if (tags.includes('japan')) return t('sections.japan');
    return '';
  };

  return (
    <main className="w-full max-w-screen-lg mx-auto px-2 py-2 pt-6">
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
          <p className="text-sm leading-relaxed whitespace-pre-line">{t('sections.roompage_disclaimer')}</p>
        </div>
      </div>
      <header className="mb-4 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">🏠 {t('sections.roomListTitle')}</h1>
      </header>
      <section className="bg-white border p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={t('sections.roompage_searchbar')}
            defaultValue={searchParams.get('q') || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-teal-500"
          />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {['korea', 'canada', 'japan'].map((r) => (
                <button key={r} onClick={() => handleFilterToggle(r, 'regions')} className={`px-3 py-1 rounded-full border transition ${selectedRegions.includes(r) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-700 border-gray-300'} hover:border-teal-500 hover:text-teal-600`}>{t(`sections.${r}`)}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} onClick={() => handleFilterToggle(g, 'genders')} className={`px-3 py-1 rounded-full border transition ${selectedGenders.includes(g) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'} hover:border-blue-500 hover:text-blue-600`}>{t(`sections.${g}`)}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {initialListings.length === 0 ? (
        <p className="py-20 text-center text-gray-500 text-base">No listings found.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {initialListings.map((post) => (
              <li key={post.id} className="px-3 py-3 sm:px-4 sm:py-3 hover:bg-gray-50 transition group">
                <div className="flex flex-row items-center w-full">
                  <a href={post.link ?? '#'} target="_blank" rel="noreferrer" className="font-semibold text-sm group-hover:underline text-blue-700 flex-1 min-w-0 truncate">{post.title}</a>
                  {isAdmin && (<button onClick={() => handleDelete(post.id)} disabled={isPending} className="p-1.5 rounded-full hover:bg-red-100 text-red-500 ml-2" aria-label={t('delete_post')}><Trash2 className="w-4 h-4" /></button>)}
                  {post.source && <span className="flex items-center gap-1 text-xs italic text-gray-500 flex-shrink-0 ml-3"><Info className="w-3.5 h-3.5 text-gray-400" />{post.source}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                  {post.price && <span className="font-medium text-gray-700">{`$${post.price}`}</span>}
                  <span>{renderTime(post.event_time)}</span>
                  <span>·</span>
                  <span className="font-semibold">{renderSourceTag(post.tag)}</span>
                  {renderGender(post.tag)}
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20} /></button>
              <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20} /></button>
            </div>
          )}
        </>
      )}
    </main>
  );
}