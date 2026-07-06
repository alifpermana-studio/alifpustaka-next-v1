import { ContentItem } from "@/data/content";
import { Heart } from "lucide-react";

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function ContentCard({ item }: { item: ContentItem }) {
  return (
    <a
      href="#"
      className="group bg-base-200 hover:ring-base-content/60 block overflow-hidden rounded-xl shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="bg-base-300 relative aspect-4/3 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            // graceful fallback — show accent gradient if image fails
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
            el.parentElement?.classList.add(
              `bg-gradient-to-br`,
              ...item.accent.split(" "),
            );
          }}
        />
        <div className="absolute top-3 right-3 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={(e) => e.preventDefault()}
            className="bg-base-200/95 hover:ring-base-content/60 hover:bg-base-300 grid h-8 w-8 place-items-center rounded-full shadow ring-1"
            aria-label="Save"
          >
            <Heart className="text-base-content h-4 w-4" />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
          <span className="bg-base-200/95 text-base-content inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow">
            {item.category}
          </span>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-base-content line-clamp-1 text-[13px] font-semibold">
          {item.title}
        </div>
        <div className="text-base-content/60 mt-0.5 flex items-center justify-between text-[11px]">
          <span className="truncate">by {item.author}</span>
          <span className="ml-2 shrink-0">
            {formatNumber(item.popularity)} downloads
          </span>
        </div>
      </div>
    </a>
  );
}
