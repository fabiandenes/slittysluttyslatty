// frontend/src/types/blog.ts

export interface Post {
  id?: number;
  title: string;
  content: string;
  author: string;
  authorEmail?: string;
  authorEmoji?: string;
  emoji?: string;
  imageBase64?: string;
  createdAt?: string;
}

export interface UserProfile {
  authenticated: boolean;
  email?: string;
  name?: string;
  picture?: string;
  emoji?: string;
}