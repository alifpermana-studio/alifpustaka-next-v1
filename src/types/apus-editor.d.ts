declare module "apus-editor" {
  import { PostStatus } from "apus-post";

  export interface PostMetadata {
    id: string;
    title: string;
    slug: string;
    image: string;
    tags: string[];
    desc: string;
  }

  export interface EditorProps {
    postMd?: string;
    postMetadata?: PostMetadata;
    onChange?: (md: string) => void;
    className?: string;
    storageKey: string;
  }

  export type EditorAction = PostStatus;

  export type EditorMessage =
    | "mismatch-key-localStorage"
    | "submit-consent"
    | "delete-consent"
    | "delete-failed"
    | "missing-required-metadata"
    | "post-saved";

  export interface ToolbarProps {
    taRef: React.RefObject<HTMLTextAreaElement | null>;
    openImgModal: () => void;
    history: string[];
    historyIndex: number;
    setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
    md: string;
    setMd: React.Dispatch<React.SetStateAction<string>>;
    bufferImg: string;
    setBufferImg: React.Dispatch<React.SetStateAction<string>>;
    tab: string;
    setTab: React.Dispatch<React.SetStateAction<"edit" | "preview">>;
    updateContent: (val: string) => void;
  }
}
