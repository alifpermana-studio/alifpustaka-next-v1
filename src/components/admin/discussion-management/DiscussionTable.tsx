import { DiscussionListItem } from "@/types/discussion";
import { Checkbox } from "@/components/ui/Checkbox";
import { DiscussionTableRow } from "./DiscussionTableRow";

interface DiscussionTableProps {
  discussions: (DiscussionListItem & {
    user?: {
      id: string;
      name: string;
      username: string;
      image: string | null;
      role: string;
    };
  })[];
  selectedDiscussions: Set<string>;
  onSelectDiscussion: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onStatusChange: (discussion: DiscussionListItem) => void;
}

export function DiscussionTable({
  discussions,
  selectedDiscussions,
  onSelectDiscussion,
  onSelectAll,
  onStatusChange,
}: DiscussionTableProps) {
  const selectableDiscussions = discussions.filter(d => d.status !== "deleted");
  const selectableCount = selectableDiscussions.length;
  const isAllSelected = selectableCount > 0 && selectedDiscussions.size === selectableCount;
  const isIndeterminate = selectedDiscussions.size > 0 && selectedDiscussions.size < selectableCount;

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-base-300 bg-base-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-base-300 bg-base-300/50">
            <th className="p-4 text-left">
              <Checkbox
                checked={isAllSelected}
                onChange={onSelectAll}
                indeterminate={isIndeterminate}
              />
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Comment
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Author
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Status
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Source
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Replies
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Created
            </th>
            <th className="text-base-content p-4 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {discussions.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-base-content/70 p-8 text-center">
                No comments found
              </td>
            </tr>
          ) : (
            discussions.map((discussion) => (
              <DiscussionTableRow
                key={discussion.id}
                discussion={discussion}
                isSelected={selectedDiscussions.has(discussion.id)}
                onSelect={onSelectDiscussion}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
