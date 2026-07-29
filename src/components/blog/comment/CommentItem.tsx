import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Discussion } from "@/types/discussion";
import {
  CustomLink,
  CustomCode,
  CustomUL,
  CustomOL,
  CustomBlockquote,
} from "@/components/post/editor/MdComponents";

interface CommentItemProps {
  comment: Discussion & {
    user?: {
      id: string;
      name: string;
      username: string;
      image: string | null;
    };
  };
  isOwn: boolean;
}

export function CommentItem({ comment, isOwn }: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const isPending = comment.status === "pending";

  return (
    <div className="bg-base-200 mb-4 rounded-lg p-4">
      <div className="mb-3 flex gap-3">
        {comment.user?.image && (
          <div className="avatar">
            <div className="h-10 w-10 rounded-full">
              <Image
                src={comment.user.image}
                alt={comment.user.name}
                width={40}
                height={40}
              />
            </div>
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base-content font-semibold">
              {comment.user?.name}
            </span>
            <span className="text-base-content/60 text-sm">{timeAgo}</span>
            {comment.editCount > 0 && (
              <span className="text-base-content/50 text-xs italic">
                (edited)
              </span>
            )}
            {isPending && isOwn && (
              <span className="bg-warning text-warning-content rounded-lg px-2 py-1 text-xs font-semibold">
                Pending Review
              </span>
            )}
          </div>
          <span className="text-base-content/70 text-xs">
            @{comment.user?.username}
          </span>
        </div>
      </div>

      <div className="prose prose-sm ml-0 max-w-none md:ml-13">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p(props) {
              return (
                <p className="text-base-content mb-2 leading-relaxed">
                  {props.children}
                </p>
              );
            },
            a(props) {
              return <CustomLink props={props} />;
            },
            code(props) {
              return <CustomCode props={props} />;
            },
            ul(props) {
              return <CustomUL props={props} />;
            },
            ol(props) {
              return <CustomOL props={props} />;
            },
            blockquote(props) {
              return <CustomBlockquote props={props} />;
            },
            strong(props) {
              return <strong className="font-bold">{props.children}</strong>;
            },
            em(props) {
              return <em className="italic">{props.children}</em>;
            },
            h1: () => null,
            h2: () => null,
            h3: () => null,
            h4: () => null,
            h5: () => null,
            h6: () => null,
            img: () => null,
            pre: () => null,
            table: () => null,
          }}
        >
          {comment.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
