import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { ProductGrid } from './ProductGrid';
import { NoticeBanner } from './NoticeBanner';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const activeSetting = await prisma.siteSetting.findUnique({ where: { key: 'notice_active' } });
  const messageSetting = await prisma.siteSetting.findUnique({ where: { key: 'notice_message' } });
  const styleSetting = await prisma.siteSetting.findUnique({ where: { key: 'notice_style' } });

  const isActive = activeSetting?.value === 'true';
  const message = messageSetting?.value || '';
  const style = (styleSetting?.value as 'info' | 'warning' | 'success' | 'danger' | 'purple') || 'purple';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Banner positioned at the very top of content area */}
      <div className="container mx-auto px-4 pt-4 pb-0">
        {isActive && message && (
          <div className="mb-4">
            <NoticeBanner message={message} style={style} />
          </div>
        )}
      </div>
      <Suspense fallback={<div className="flex items-center justify-center py-20">Loading...</div>}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
