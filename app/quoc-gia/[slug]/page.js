import { redirect } from 'next/navigation';

export default async function CountryRoute({ params }) {
  const { slug } = await params;
  redirect(`/danh-sach/${encodeURIComponent(slug)}`);
}
