export type DiscussionStatus = "pending" | "published" | "banned" | "deleted";
export type DiscussionSourceType =
  "blog_post" | "product_review" | "product_qa";

export interface Discussion {
  id: string;
  content: string;
  status: DiscussionStatus;
  sourceType: DiscussionSourceType;
  sourceId: string;
  userId: string;
  parentId: string | null;
  editedAt: Date | null;
  editCount: number;
  deletedAt: Date | null;
  permanentDeleteAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    role: string;
  };
  replies?: Discussion[];
  sourceTitle?: string;
}

export interface DiscussionFilters {
  search?: string;
  status?: DiscussionStatus | "";
  sourceType?: DiscussionSourceType | "";
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}

export interface DiscussionListItem extends Discussion {
  replyCount: number;
  canEdit: boolean;
  canDelete: boolean;
}
