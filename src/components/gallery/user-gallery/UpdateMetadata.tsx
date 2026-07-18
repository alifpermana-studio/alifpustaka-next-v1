'use client';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Switch from '@/components/form/switch/Switch';
import { UpdateImage } from 'apus-gallery';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  editData: UpdateImage;
  setEditData: React.Dispatch<React.SetStateAction<UpdateImage>>;
}

export const UpdateMetadata = ({ editData, setEditData }: Props) => {
  const [newTag, setNewTag] = useState('');

  const deleteTag = (tagToRemove: string) => {
    setEditData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    })); // Using filter
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission when Enter is pressed
      setEditData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      setEditData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag(''); // Reset value if space is detected
    } else {
      setNewTag(value.replace(' ', '-')); // Otherwise, update the value normally
    }
  };

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
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
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
          value={editData.slug}
          onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
        />
      </div>

      <div>
        <Label>
          Tags
          <span className="italic">— separate tags with comma (",")</span>
        </Label>
        <Input
          type="text"
          id="tags"
          name="tags"
          placeholder="alif-pustaka"
          value={newTag}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <div className="mt-3 flex flex-row flex-wrap gap-3">
          {editData.tags.map((tag, i) => (
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
          value={editData.path}
          onChange={(e) => setEditData({ ...editData, path: e.target.value })}
        />
      </div>
      <div className="flex flex-row items-center gap-4">
        <Label>
          Private:<span className="text-error-500"></span>
        </Label>
        <Switch
          label=""
          defaultChecked={editData.isPrivate}
          onChange={() => setEditData((prev) => ({ ...prev, isPrivate: !editData.isPrivate }))}
        />
      </div>
    </div>
  );
};
