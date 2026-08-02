import { DiscussionListItem } from "@/types/discussion";
import { DiscussionTableRow } from "./DiscussionTableRow";
import { Checkbox } from "@/components/ui/Checkbox";

interface DiscussionTableProps {
  discussions: DiscussionListItem[];
  selectedDiscussions: Set<string>;
  onSelectDiscussion: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (discussion: DiscussionListItem) => void;
  onDelete: (discussion: DiscussionListItem) => void;
}

export function DiscussionTable({
  discussions,
  selectedDiscussions,
  onSelectDiscussion,
  onSelectAll,
  onEdit,
  onDelete,
}: DiscussionTableProps) {
  const selectableDiscussions = discussions.filter(d => d.status !== "deleted");
  const selectableCount = selectableDiscussions.length;
  const isAllSelected = selectableCount > 0 && selectedDiscussions.size === selectableCount;
  const isIndeterminate = selectedDiscussions.size > 0 && selectedDiscussions.size < selectableCount;

  if (discussions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">No comments found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th className="w-12">
              <Checkbox
                checked={isAllSelected}
                onChange={onSelectAll}
                indeterminate={isIndeterminate}
              />
            </th>
            <th>Content</th>
            <th>Status</th>
            <th>Source</th>
            <th>Replies</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {discussions.map((discussion) => (
            <DiscussionTableRow
              key={discussion.id}
              discussion={discussion}
              isSelected={selectedDiscussions.has(discussion.id)}
              onSelect={onSelectDiscussion}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
