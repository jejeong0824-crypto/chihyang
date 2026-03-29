export interface DbUser {
  id: string;
  email: string;
  nickname: string | null;
  profile_image: string | null;
  friend_code: string;
  created_at: string;
  updated_at: string;
}

export interface DbReview {
  id: string;
  user_id: string;
  content_type: "MOVIE" | "BOOK";
  content_id: string;
  content_title: string;
  content_image: string | null;
  body: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbTasteProfile {
  id: string;
  user_id: string;
  keywords: string[];
  summary: string;
  type: string;
  updated_at: string;
}

export interface DbFriendship {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  created_at: string;
}

export interface DbReviewWithUser extends DbReview {
  users: Pick<DbUser, "id" | "nickname" | "profile_image">;
}

export interface DbUserWithTaste extends DbUser {
  taste_profiles: DbTasteProfile | null;
}

export interface DbFriendshipWithUsers extends DbFriendship {
  requester: DbUserWithTaste;
  receiver: DbUserWithTaste;
}
