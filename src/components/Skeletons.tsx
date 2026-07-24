import React from 'react';

/**
 * Skeleton loader component for individual Product Cards.
 * Matches ProductCard layout with pulsing placeholder boxes for image, title, price, and CTA.
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-4 flex flex-col h-full animate-pulse shadow-sm">
      {/* Image / Banner Container */}
      <div className="aspect-[4/3] rounded-[1.5rem] bg-slate-200/80 relative overflow-hidden mb-6 flex items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full bg-slate-300/60" />
        <div className="absolute top-4 left-4 w-20 h-5 bg-slate-300/80 rounded-full" />
      </div>

      {/* Content Section */}
      <div className="px-4 pb-4 flex flex-col flex-1">
        {/* Title line */}
        <div className="h-6 bg-slate-200 rounded-xl w-3/4 mb-3" />
        
        {/* Price tag line */}
        <div className="h-7 bg-indigo-200/60 rounded-xl w-1/3 mb-4" />

        {/* Description lines */}
        <div className="space-y-2 mb-8">
          <div className="h-3.5 bg-slate-200 rounded-lg w-full" />
          <div className="h-3.5 bg-slate-200 rounded-lg w-4/5" />
        </div>

        {/* Action button */}
        <div className="mt-auto h-12 bg-slate-200 rounded-2xl w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton Grid for Product lists (Marketplace, Homepage, catalog views).
 */
export function ProductGridSkeleton({ count = 3, cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }: { count?: number; cols?: string }) {
  return (
    <div className={`grid ${cols} gap-8`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader component for individual Blog Post Cards.
 * Matches Blog page editorial card structure.
 */
export function BlogPostSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-pulse mb-8 flex flex-col">
      {/* Thumbnail Aspect Box */}
      <div className="aspect-video bg-slate-200/80 relative">
        <div className="absolute top-6 left-6 w-24 h-6 bg-slate-300/80 rounded-full" />
      </div>

      {/* Body Section */}
      <div className="p-8 space-y-4">
        {/* Date and Author Meta row */}
        <div className="flex items-center gap-4">
          <div className="h-3 bg-slate-200 rounded-full w-24" />
          <div className="h-3 bg-slate-200 rounded-full w-20" />
        </div>

        {/* Main Post Title */}
        <div className="space-y-2 pt-1">
          <div className="h-6 bg-slate-200 rounded-xl w-11/12" />
          <div className="h-6 bg-slate-200 rounded-xl w-3/4" />
        </div>

        {/* Post Excerpt */}
        <div className="space-y-2 pt-2">
          <div className="h-3.5 bg-slate-200 rounded-lg w-full" />
          <div className="h-3.5 bg-slate-200 rounded-lg w-full" />
          <div className="h-3.5 bg-slate-200 rounded-lg w-2/3" />
        </div>

        {/* Read Article Link */}
        <div className="pt-4 flex items-center justify-between">
          <div className="h-4 bg-indigo-200/70 rounded-lg w-28" />
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Grid for Blog Post lists.
 */
export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <BlogPostSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Detailed Skeleton screen for a single Product view page.
 */
export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-pulse">
      {/* Breadcrumb line */}
      <div className="h-4 bg-slate-200 rounded-lg w-64 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Column - Product Image Card */}
        <div className="bg-slate-200 rounded-[3rem] aspect-square w-full" />

        {/* Right Column - Details */}
        <div className="space-y-6">
          <div className="w-28 h-6 bg-indigo-100 rounded-full" />
          <div className="h-10 bg-slate-200 rounded-2xl w-3/4" />
          <div className="h-8 bg-indigo-200/80 rounded-xl w-1/3" />
          
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-200 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 rounded-lg w-4/5" />
          </div>

          <div className="pt-6 space-y-4">
            <div className="h-14 bg-slate-200 rounded-2xl w-full" />
            <div className="h-12 bg-slate-100 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detailed Skeleton screen for a single Blog Post detail page.
 */
export function BlogPostDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-pulse space-y-8">
      {/* Category Pill & Back button row */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-200 rounded-full w-24" />
        <div className="h-6 bg-indigo-100 rounded-full w-28" />
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <div className="h-10 bg-slate-200 rounded-2xl w-11/12" />
        <div className="h-10 bg-slate-200 rounded-2xl w-3/4" />
      </div>

      {/* Author and Date Meta Bar */}
      <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-1">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="h-3 bg-slate-200 rounded w-16" />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full h-80 bg-slate-200 rounded-[2.5rem]" />

      {/* Body Content paragraph blocks */}
      <div className="space-y-4 pt-4">
        <div className="h-4 bg-slate-200 rounded-lg w-full" />
        <div className="h-4 bg-slate-200 rounded-lg w-full" />
        <div className="h-4 bg-slate-200 rounded-lg w-11/12" />
        <div className="h-4 bg-slate-200 rounded-lg w-4/5" />
        <div className="h-24 bg-slate-100 rounded-2xl w-full my-6" />
        <div className="h-4 bg-slate-200 rounded-lg w-full" />
        <div className="h-4 bg-slate-200 rounded-lg w-9/12" />
      </div>
    </div>
  );
}
