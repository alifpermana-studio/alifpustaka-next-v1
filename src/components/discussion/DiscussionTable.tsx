import { DiscussionListItem } from "@/types/discussion";
import { DiscussionTableRow } from "./DiscussionTableRow";

interface DiscussionTableProps {
  discussions: DiscussionListItem[];
  onEdit: (discussion: DiscussionListItem) => void;
  onDelete: (discussion: DiscussionListItem) => void;
}

export function DiscussionTable({
  discussions,
  onEdit,
  onDelete,
}: DiscussionTableProps) {
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
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
