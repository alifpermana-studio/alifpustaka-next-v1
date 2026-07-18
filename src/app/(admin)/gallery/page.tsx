import { UploadCard } from "@/components/gallery/upload-card/UploadCard";
import { UserGallery } from "@/components/gallery/user-gallery/UserGallery";

export default async function Gallery() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7 dark:text-white/90">
          Gallery
        </h3>
        <div className="space-y-6">
          <UploadCard />
          <UserGallery />
        </div>
      </div>
    </div>
  );
}
