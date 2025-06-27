'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { extractFirstImageSrc } from '../../../../utilities/extractFirstImage';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function WriteForm() {
  const { locale } = useParams() as { locale: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const idParam = searchParams.get('id');
  const isEdit = Boolean(idParam);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('CA$');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 수정모드: 기존 데이터 불러오기
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hot_deal_posts')
        .select('title, content, thumbnail_url, price, currency_type')
        .eq('id', Number(idParam))
        .single();
      if (data && !error) {
        setTitle(data.title);
        setContent(data.content);
        setThumbnailUrl(data.thumbnail_url ?? '');
        setPrice(data.price);
        setCurrency(data.currency_type);
      }
      setLoading(false);
    })();
  }, [isEdit, idParam, supabase]);

  // 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || price <= 0) {
      setError('Title, content, 가격을 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);

    // 1. 로그인된 유저 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    console.log('현재 로그인 유저:', user);
    

    // 2. user.id(uuid)로 user_profiles에서 닉네임 조회 (컬럼명: uuid)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_nickname')
      .eq('id', user.id)    // ← 여기 꼭 uuid로!
      .single();
      console.log('user_profiles 조회 결과:', profile, profileError);

    if (profileError || !profile || !profile.user_nickname) {
      setError('프로필에 닉네임이 등록되어 있지 않습니다.');
      setLoading(false);
      return;
    }

    // 3. content에서 첫번째 이미지 추출
    const autoThumb = extractFirstImageSrc(content);

    // 4. payload에 user_nickname 포함 (NOT NULL 보장)
    const payload = {
      title: title.trim(),
      content,
      thumbnail_url: thumbnailUrl || autoThumb || null,
      price,
      currency_type: currency,
      user_nickname: profile.user_nickname,  // 반드시 값이 있음!
    };

    let dbError: any = null;
    if (isEdit) {
      const { error } = await supabase
        .from('hot_deal_posts')
        .update(payload)
        .eq('id', Number(idParam));
      dbError = error;
    } else {
      const { error } = await supabase
        .from('hot_deal_posts')
        .insert([payload]);
      dbError = error;
    }

    if (dbError) setError(dbError.message);
    else router.push(`/${locale}/hot-deal`);
    setLoading(false);
  };

  // Quill 옵션
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
  ];

  return (
    <div className="pt-4 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Hot Deal' : 'Write Hot Deal'}
      </h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 제목 */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border rounded px-4 py-2 text-lg"
            disabled={loading}
          />
        </div>
        {/* 가격/통화 */}
        <div>
          <label className="block mb-1 font-medium">Price</label>
          <div className="flex gap-3">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="border rounded px-3 py-2 text-base min-w-[100px]"
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
              className="w-full border rounded px-4 py-3 text-base"
              placeholder="Amount"
              disabled={loading}
            />
          </div>
        </div>
        {/* 리치 에디터 */}
        <div>
          <label className="block mb-1 font-medium">Content</label>
          <div className="bg-white border rounded">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Write your deal details here..."
              className="
              text-base
              [&_.ql-container]:min-h-[320px]  // 입력영역만!
              [&_.ql-editor]:min-h-[220px] min-w-fit   // 내부 편집 영역도!
            "
              // ↑ Tailwind로 에디터 높이와 폰트 크기 업!
            />
          </div>
        </div>
        {/* 썸네일 URL */}
        <div>
          <label className="block mb-1 font-medium">Thumbnail URL</label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            className="w-full border rounded px-4 py-2"
            disabled={loading}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg hover:bg-teal-700 disabled:opacity-50 font-bold tracking-wide"
        >
          {loading
            ? isEdit ? 'Updating...' : 'Saving...'
            : isEdit ? 'Update' : 'Save'}
        </button>
      </form>
    </div>
  );
}
