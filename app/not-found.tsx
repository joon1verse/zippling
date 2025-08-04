import { getLocale, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-gray-800">
      <h1 className="text-3xl font-bold">404</h1>
      <p>Page Not Found</p>
      <Link href={`/${locale}`} className="text-blue-600 underline">
        Go back home
      </Link>
    </main>
  );
}
