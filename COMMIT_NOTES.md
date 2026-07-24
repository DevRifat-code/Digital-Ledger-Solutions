# Commit: ba5abe9e648dafb95efb99c45b1fa0d0f5123d97

**Author:** Md Rifat Hossain  
**Date:** July 24, 2026  
**Message:** refactor: implement skeleton loaders across pages

## Summary
Replaced generic loading spinners with specialized skeleton components to improve perceived performance and UI consistency during data fetching.

## Files Changed

### New Files
- **src/components/Skeletons.tsx** (+185 lines)
  - `ProductCardSkeleton` - Skeleton for individual product cards
  - `ProductGridSkeleton` - Grid container for product lists
  - `BlogPostSkeleton` - Skeleton for blog post cards
  - `BlogGridSkeleton` - Grid container for blog posts
  - `ProductDetailsSkeleton` - Full-page skeleton for product details
  - `BlogPostDetailsSkeleton` - Full-page skeleton for blog post details

### Modified Files
1. **src/pages/Blog.tsx** (+2, -4)
   - Import `BlogGridSkeleton`
   - Replace `Loader2` spinner with contextual skeleton

2. **src/pages/BlogPostDetails.tsx** (+3, -5)
   - Import `BlogPostDetailsSkeleton`
   - Replace generic loader with full-page skeleton

3. **src/pages/Home.tsx** (+7, -1)
   - Add `loadingFeatured` state
   - Import `ProductGridSkeleton`
   - Use skeleton during featured products fetch

4. **src/pages/Marketplace.tsx** (+2, -5)
   - Import `ProductGridSkeleton`
   - Replace manual skeleton divs with component

5. **src/pages/ProductDetails.tsx** (+8, -1)
   - Import `ProductDetailsSkeleton`
   - Replace text loader with full-page skeleton

## Statistics
- **Total Additions:** 207
- **Total Deletions:** 16
- **Total Changes:** 223

## URL
https://github.com/DevRifat-code/Digital-Ledger-Solutions/commit/ba5abe9e648dafb95efb99c45b1fa0d0f5123d97

## Key Benefits
✅ Improved perceived performance  
✅ Better UI consistency  
✅ Contextual loading states  
✅ Centralized, reusable components  
✅ Enhanced user experience with animations
