'use client';

import { GridLayout } from './GridLayout';
import { ListLayout } from './ListLayout';
import { RotateCw } from 'lucide-react';
import { useGallery } from '@/hooks/useGallery';

export const GalleryContent = () => {
  const { isGrid, loading } = useGallery();

  if (isGrid) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div
          className={`${loading ? 'flex' : 'hidden'} w-full flex-row items-center justify-center gap-4`}
        >
          <RotateCw className={` ${loading ? 'animate-spin' : ''}`} />
          <p>Retrieve related image...</p>
        </div>
        <GridLayout />
      </div>
    );
  } else {
    return <ListLayout />;
  }
};
