import { useGallery } from "@/hooks/useGallery";
import { ImageGallery } from "apus-gallery";
import { Lock } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  onClose: () => void;
  setImg: Dispatch<SetStateAction<string>>;
};

export const GalleryImageCard = ({ onClose, setImg }: Props) => {
  const { data, loading } = useGallery();
  const [imgList, setImgList] = useState<ImageGallery[]>([]);

  useEffect(() => {
    console.log("checkload: ", loading);
    if (!loading) {
      setImgList(data);
    }
  }, [loading]);

  return (
    <div className="grid w-full grid-cols-1 justify-center gap-3 rounded-md md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading ? (
        <div className="text-base-content mx-auto">loading...</div>
      ) : (
        imgList.map((image, i) => (
          <BoxImage key={i} image={image} setImg={setImg} onClose={onClose} />
        ))
      )}
    </div>
  );
};

type BoxImageProps = {
  image: ImageGallery;
  setImg: Dispatch<SetStateAction<string>>;
  onClose: () => void;
};

const BoxImage = ({ image, setImg, onClose }: BoxImageProps) => {
  const [hover, setHover] = useState(false);

  const handleSelectImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setImg(`/api/image?src=${image.slug}&p=${image.isPrivate}`);
    onClose();
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative cursor-pointer rounded-md"
    >
      <div className="relative aspect-3/2 overflow-hidden rounded-md">
        <Image
          className={`h-full w-full object-cover transition-all duration-500 ease-in-out ${hover && "scale-110"}`}
          src={`/api/image?src=${image.slug}&p=${image.isPrivate}`}
          alt="thumbnail"
          width={120}
          height={54}
          quality={20}
          unoptimized
          onClick={handleSelectImage}
        />
        <div
          onClick={handleSelectImage}
          className="bg-accent text-accent-content absolute bottom-0 flex w-full items-center justify-between rounded-b-md p-1 font-semibold backdrop-blur-md"
        >
          <p
            title={image.title}
            className={`text-sm transition-all duration-500 ease-in-out ${hover ? "overflow-hidden text-clip whitespace-normal" : "overflow-hidden text-ellipsis whitespace-nowrap"}`}
          >
            {image.title}
          </p>
        </div>
        <div
          className={`absolute top-1 right-1 ${image.isPrivate ? "flex" : "hidden"}`}
        >
          <Lock />
        </div>
      </div>
    </div>
  );
};
