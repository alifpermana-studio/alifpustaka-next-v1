import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { UploadImage } from "apus-gallery";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  imageData: UploadImage;
  setImageData: React.Dispatch<React.SetStateAction<UploadImage>>;
}

const UploadMetadata = ({ imageData, setImageData }: Props) => {
  const [tag, setTag] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(",")) {
      setImageData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTag(""); // Reset value if space is detected
    } else {
      setTag(value.replace(" ", "-")); // Otherwise, update the value normally
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission when Enter is pressed
      setImageData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTag("");
    }
  };

  const deleteTag = (tagToRemove: string) => {
    setImageData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    })); // Using filter
  };

  useEffect(() => {
    setImageData((prev) => ({
      ...prev,
      slug: imageData.title
        .trim()
        .replaceAll(" ", "-")
        .replaceAll(
          /[/+\=\@\$\|\^\~\[\]\{\}\`\#\%\*\_\<\>\,\.\"\'\(\)\?\!\:\;\/]/g,
          "",
        )
        .replace(/(-)\1+/g, "$1")
        .toLowerCase(),
    }));
  }, [imageData.title]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div>
        <Label>
          Title<span className="text-error-500">*</span>
        </Label>
        <Input
          type="text"
          id="title"
          name="title"
          placeholder="Alif Pustaka Logo"
          value={imageData.title}
          onChange={(e) =>
            setImageData({ ...imageData, title: e.target.value })
          }
        />
      </div>

      <div>
        <Label>
          Slug<span className="text-error-500">*</span>
        </Label>
        <Input
          type="text"
          id="slug"
          name="slug"
          placeholder="alif-pustaka-logo"
          value={imageData.slug}
          onChange={(e) => setImageData({ ...imageData, slug: e.target.value })}
        />
      </div>

      <div>
        <Label>
          Tags
          <span className="italic">— separate tags with whitespace (" ")</span>
        </Label>
        <Input
          type="text"
          id="tags"
          name="tags"
          placeholder="alif-pustaka"
          value={tag}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <div className="mt-3 flex flex-row flex-wrap gap-3">
          {imageData.tags.map((tag, i) => (
            <div
              key={i}
              className="flex flex-row items-center justify-between overflow-hidden rounded-lg bg-blue-200 text-black"
            >
              <span className="px-2 py-1">{tag}</span>
              <button
                type="button"
                className="bg-blue-300 px-2 py-1 hover:bg-blue-400 focus:bg-blue-500"
                onClick={() => deleteTag(tag)}
              >
                <X />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>
          Path<span className="text-error-500">*</span>
        </Label>
        <Input
          type="text"
          id="path"
          name="path"
          placeholder="user"
          value={imageData.path}
          onChange={(e) => setImageData({ ...imageData, path: e.target.value })}
        />
      </div>
    </div>
  );
};

export default UploadMetadata;
