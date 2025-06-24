// app/[locale]/hot-deal/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@server/supabasePublicClient";

interface Post {
  id: number;
  title: string;
  created_at: string;
  thumbnail_url: string | null;
}

export default function HotDealPage() {
  const { locale } = useParams() as { locale: string };

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, created_at, thumbnail_url")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else if (data) {
        setPosts(data as Post[]);
      }

      setLoading(false);
    }

    fetchPosts();
  }, []);

  if (loading) {
    return <p className="p-6 text-center">Loading...</p>;
  }
  if (error) {
    return <p className="p-6 text-center text-red-600">Error: {error}</p>;
  }

  return (
    <div className="pt-16 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Hot Deals</h1>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts available.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <div className="flex items-center space-x-4 bg-white rounded-lg shadow p-4">
                <Image
                  src={post.thumbnail_url ?? "/images/no_thum.png"}
                  alt={post.title}
                  width={80}
                  height={80}
                  className="rounded object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-gray-500 text-sm">
                    {new Date(post.created_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
