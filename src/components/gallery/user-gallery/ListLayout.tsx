'use client';

import { useGallery } from '@/hooks/useGallery';

export const ListLayout = () => {
  const { data } = useGallery();
  return (
    <div className="flex w-full flex-col gap-3">
      {data.map((image, i) => (
        <div key={i}>{image.title}</div>
      ))}
    </div>
  );
};
