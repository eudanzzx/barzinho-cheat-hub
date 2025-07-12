import React, { Suspense, lazy } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface LazyComponentLoaderProps {
  componentPath: string;
  fallback?: React.ReactNode;
  [key: string]: any;
}

const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({ 
  componentPath, 
  fallback, 
  ...props 
}) => {
  const LazyComponent = lazy(() => import(componentPath));

  const defaultFallback = (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyComponentLoader;