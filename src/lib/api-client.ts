import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// API Base URL
// - Client-side (browser): Uses NEXT_PUBLIC_ADMIN_API_URL
// - Server-side (container): Uses NEXT_PUBLIC_ADMIN_API_URL
// Both use the same public URL for simplicity
const API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            window.location.href = `${API_BASE_URL}/signin?returnUrl=${encodeURIComponent(window.location.href)}`;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image?: string;
    bio?: string;
  };
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  publishedAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  posts: PublicPost[];
  total: number;
}

export const publicApi = {
  getPosts: (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    search?: string;
  }) =>
    apiClient.get<PaginatedResponse<PublicPost>>("/public/posts", {
      params,
    }),

  getPostBySlug: (slug: string) =>
    apiClient.get<PublicPost>(`/public/posts/${slug}`),

  getFeaturedPosts: () =>
    apiClient.get<PublicPost[]>("/public/posts/featured"),

  searchPosts: (query: string, limit?: number) =>
    apiClient.get<SearchResult>("/public/search", {
      params: { q: query, limit },
    }),
};

export const userApi = {
  getBookmarks: () => apiClient.get<PublicPost[]>("/user/bookmarks"),

  getProfile: () =>
    apiClient.get<{
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
    }>("/user/profile"),
};
