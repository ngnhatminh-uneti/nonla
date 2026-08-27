import { redirect } from 'next/navigation';

export default async function GenreRoute({ params }) {
  const { slug } = await params;
  redirect(`/danh-sach/${encodeURIComponent(slug)}`);
}
