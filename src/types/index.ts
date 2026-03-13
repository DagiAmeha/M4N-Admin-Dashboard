export interface User {
  _id: string;
  firebaseUid: string;
  username: string;
  email: string;
  role: "user" | "admin";
  is_premium: boolean;
  premium_until?: string;
  is_admin: boolean;
  user?: {
    username: string;
  };
  profile_image?: string;
  phone_number: string;
  total_donations: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sermon {
  _id: string;
  title: string;
  pastor_name: string;
  date: string;
  slug: string;
  category: Category | string;
  cover_image: string;
  audio_file?: string;
  is_premium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  category: string;
  description: string;
  fileUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  cover_image?: string;
  registration_count: number;
  is_full: boolean;
  allows_registration: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  user_id: string;
  posted_by: string;
  text: string;
  created_at: string;
}

export interface Testimony {
  _id?: string;
  id: number;
  title: string;
  verse?: string;
  text_content: string;
  images: string[];
  posted_by: string;
  youtube_video_id?: string;
  likes: string[];
  like_count?: number;
  comments: Comment[];
  comment_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  durationDays: number;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan | string;
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  paymentRef: string;
  type: string;
  amount: number;
  startDate?: string;
  endDate?: string;
  user?: {
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  _id: string;
  userId: string;
  book: Book | string;
  amount: number;
  paymentRef: string;
  status: "pending" | "completed" | "failed";
  user?: {
    username: string;
  };
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentRef: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PaymentSummaryData {
  month: string;
  tithe: number;
  gift: number;
  offering: number;
  other: number;
}
