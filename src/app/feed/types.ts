// Shared feed item types — imported by both FeedClient (client) and actions.ts (server)

export type FeedRecommendation = {
  type: "recommendation";
  id: string;
  user_id: string;
  professional_name: string;
  category: string;
  city: string;
  note: string | null;
  address: string | null;
  price_range: string | null;
  created_at: string;
  likes_count: number;
  liked_by_me: boolean;
  saved_by_me: boolean;
  profile: {
    full_name: string | null;
    city: string | null;
    username: string | null;
    avatar_url: string | null;
    account_type: string | null;
  } | null;
};

export type FeedRequest = {
  type: "request";
  id: string;
  user_id: string;
  content: string;
  category: string;
  city: string;
  created_at: string;
  profile: { full_name: string | null } | null;
};

export type FeedItem = FeedRecommendation | FeedRequest;
