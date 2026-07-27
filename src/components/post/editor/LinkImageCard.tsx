import Input from "@/components/form/input/InputField";
import React, { Dispatch, SetStateAction, useState } from "react";

type Props = {
  onClose: () => void;
  setImg: Dispatch<SetStateAction<string>>;
};

export const LinkImageCard = ({ onClose, setImg }: Props) => {
  const [imgUrl, setImgUrl] = useState("");

  const handleAddImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setImg(imgUrl);
    onClose();
  };

  return (
    <div className="w-full">
      <div className="grid w-full gap-4">
        <Input
          type="url"
          id="url"
          name="url"
          value={imgUrl}
          onChange={(e) => setImgUrl(e.target.value)}
          placeholder="https://domain.com/yourimage.jpg"
        />
        <button
          className="rounded-lg bg-gray-200 px-8 py-2 text-gray-200 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100 dark:bg-gray-800 dark:text-gray-200"
          onClick={handleAddImage}
        >
          Add Image
        </button>
      </div>
    </div>
  );
};
