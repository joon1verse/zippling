'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import type { Database } from '@server/types';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import type { User } from '@supabase/supabase-js';

// 첫 번째 이미지 src 추출 유틸
import { extractFirstImageSrc } from '../../../../utilities/extractFirstImage';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WriteForm() {
  const { locale } = useParams() as { locale: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const idParam = searchParams.get('id');
  const isEdit = Boolean(idParam);

  // 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('CA$');
  const [Nickname, setProfileNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) 수정 모드: 기존 데이터 불러오기
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hot_deal_posts')
        .select('title, content, thumbnail_url, price, currency_type, user_nickname')
        .eq('id', Number(idParam))
        .single();
      if (data && !error) {
        setTitle(data.title);
        setContent(data.content);
        setThumbnailUrl(data.thumbnail_url ?? '');
        setPrice(data.price);
        setCurrency(data.currency_type);
        // 수정 모드라면 기존에 저장된 user_nickname도 가져와 둠
        setProfileNickname(data.user_nickname);
      }
      setLoading(false);
    })();
  }, [isEdit, idParam, supabase]);

  // 2) 현재 로그인한 유저의 프로필 닉네임 조회
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('user_nickname')
        .eq('user_id', user.id)
        .single();
      if (profile && !error) {
        setProfileNickname(profile.user_nickname);
      }
    })();
  }, [supabase]);

  // 3) 저장/수정 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || price <= 0) {
      setError('Title, content 그리고 양수인 price를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);

    // content에서 첫번째 이미지 src 추출
    const autoThumb = extractFirstImageSrc(content);

    // ② 현재 로그인된 유저 정보 가져오기
   const {
     data: { user },
     error: authErr,
   } = await supabase.auth.getUser();

   // ③ 프로필에서 닉네임 조회 (user_id 컬럼이 있다고 가정)
   let nickname = 'Anonymous'; // 기본값
   if (user) {
       const { data: prof, error: profErr } = await supabase
      .from('user_profiles')
       .select('user_nickname')
       .eq('user_id', user.id)
       .single();
     if (prof && !profErr) {
       nickname = prof.user_nickname;
     }
   }

    // payload 작성: profileNickname을 user_nickname에 포함
    const payload: Partial<Database['public']['Tables']['hot_deal_posts']['Insert']> = {
      title: title.trim(),
      content,
      thumbnail_url: thumbnailUrl || autoThumb || null,
      price,
      currency_type: currency,
      user_nickname: Nickname || null,
    };

    let dbError = null;
    if (isEdit) {
      const { error } = await supabase
        .from('hot_deal_posts')
        .update(payload as any)
        .eq('id', Number(idParam));
      dbError = error;
    } else {
      const { error } = await supabase
        .from('hot_deal_posts')
        .insert([payload]);
      dbError = error;
    }

    if (dbError) {
      setError(dbError.message);
    } else {
      router.push(`/${locale}/hot-deal`);
    }
    setLoading(false);
  };

  // Quill 툴바 설정
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };
  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image'];

  return (
    <div className="pt-16 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Edit Hot Deal' : 'Write Hot Deal'}</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={loading}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* 2. Price & Currency */}
        <div>
          <label className="block mb-1 font-medium">Price</label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              disabled={loading}
              className="border rounded px-2 py-2"
            >
              <option value="CA$">CA$</option>
              <option value="US$">US$</option>
              <option value="JPY">JPY</option>
              <option value="KRW">KRW</option>
            </select>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              min={0}
              disabled={loading}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* 3. Content (Rich Editor) */}
        <div>
          <label className="block mb-1 font-medium">Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Write your deal details here..."
          />
        </div>

        {/* 4. Thumbnail URL (수동 입력) */}
        <div>
          <label className="block mb-1 font-medium">Thumbnail URL</label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            disabled={loading}
            placeholder="https://example.com/image.jpg"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* 5. Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update' : 'Save'}
        </button>
      </form>
    </div>
  );
}
