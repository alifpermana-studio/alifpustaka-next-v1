'use client';

import { GalleryContent } from './GalleryContent';
import { GalleryFilter } from './GalleryFilter';

export const UserGallery = () => {
  /* const reloadGallery = async () => {
    setIsReloadGallery(true);
    try {
      const { success, message, data, error } = await getImageList(filter);

      if (success) {
        setImageList(data);
      } else {
        console.log('Error unknown: ', error);
      }
    } catch (error) {
      console.error('Error unknown; ', error);
    }
    setIsReloadGallery(false);
  }; */

  /* useEffect(() => {
    if (filter.search.length >= 3) {
      reloadGallery();
    }
  }, [filter.search.length]);

  useEffect(() => {
    if (isReloadGallery) {
      reloadGallery();
    }
  }, [isReloadGallery]);

  useEffect(() => {
    reloadGallery();
  }, [filter.sort, filter.order, filter.skip, filter.max]); */

  return (
    <div className="rounded-2xl border border-gray-200 p-5 text-gray-800 lg:p-6 dark:border-gray-800 dark:text-gray-200">
      <div className="grid w-full grid-cols-1 gap-5">
        <GalleryFilter />
        <GalleryContent />
      </div>
    </div>
  );
};
