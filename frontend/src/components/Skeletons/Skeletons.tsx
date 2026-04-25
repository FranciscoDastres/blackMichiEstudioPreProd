// Reusable skeleton loaders with shimmer effect.
// Uses Tailwind's animate-pulse + app color tokens.

interface SkeletonBoxProps {
  className?: string;
}

export function SkeletonBox({ className = "" }: SkeletonBoxProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background/40">
      <SkeletonBox className="w-full aspect-square rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <SkeletonBox className="h-5 w-20" />
          <SkeletonBox className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface ProductListSkeletonProps {
  count?: number;
}

export function ProductListSkeleton({ count = 8 }: ProductListSkeletonProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <SkeletonBox className="h-8 w-64 mb-8" />
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 space-y-4">
            <SkeletonBox className="h-40 w-full rounded-xl" />
            <SkeletonBox className="h-32 w-full rounded-xl" />
            <SkeletonBox className="h-24 w-full rounded-xl" />
          </aside>
          {/* Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-3">
          <SkeletonBox className="w-full aspect-square rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="space-y-5">
          <SkeletonBox className="h-10 w-3/4" />
          <SkeletonBox className="h-5 w-1/3" />
          <SkeletonBox className="h-8 w-40" />
          <div className="space-y-2 pt-4">
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />
            <SkeletonBox className="h-4 w-4/6" />
          </div>
          <div className="flex gap-3 pt-6">
            <SkeletonBox className="h-12 w-32 rounded-lg" />
            <SkeletonBox className="h-12 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
