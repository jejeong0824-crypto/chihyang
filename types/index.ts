export type ContentType = "MOVIE" | "BOOK";

export type FriendshipStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface SearchResult {
  contentId: string;
  contentTitle: string;
  contentImage: string | null;
  year?: string;
  author?: string;
}

export interface ReviewWithUser {
  id: string;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  contentImage: string | null;
  body: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  user: {
    id: string;
    nickname: string | null;
    profileImage: string | null;
  };
}

export interface TasteProfileData {
  keywords: string[];
  summary: string;
  type: string;
}

export interface TasteComparison {
  myKeywords: string[];
  friendKeywords: string[];
  overlapping: string[];
  matchRate: number;
}
