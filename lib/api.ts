import { getAuthHeaders, setToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new ApiError(
      response.status,
      errorData.message || response.statusText
    );
  }
  return response.json();
};

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
};

// Auth API functions
export const login = async (email: string, password: string) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.token) {
    setToken(response.token);
  }

  return response;
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
};

export const getCurrentUser = async () => {
  return apiRequest("/auth/me");
};

// Blog Posts API functions
export const getAllPosts = async (page = 1, limit = 10, search = "") => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  return apiRequest(`/posts?${queryParams}`);
};

export const getPostById = async (id: string) => {
  return apiRequest(`/posts/${id}`);
};

export const getUserPosts = async (page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return apiRequest(`/posts/user?${queryParams}`);
};

export const createPost = async (postData: {
  title: string;
  content: string;
  tags?: string[];
  image?: string;
}) => {
  return apiRequest("/posts", {
    method: "POST",
    body: JSON.stringify(postData),
  });
};

export const updatePost = async (
  id: string,
  postData: {
    title: string;
    content: string;
    tags?: string[];
    image?: string;
  }
) => {
  return apiRequest(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(postData),
  });
};

export const deletePost = async (id: string) => {
  return apiRequest(`/posts/${id}`, {
    method: "DELETE",
  });
};

// Comments API functions
export const getPostComments = async (postId: string) => {
  return apiRequest(`/posts/${postId}/comments`);
};

export const createComment = async (postId: string, content: string) => {
  return apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

// Likes API functions
export const toggleLike = async (postId: string) => {
  return apiRequest(`/posts/${postId}/like`, {
    method: "POST",
  });
};

export const getPostLikes = async (postId: string) => {
  return apiRequest(`/posts/${postId}/likes`);
};

// Profile API functions
export const updateProfile = async (profileData: {
  username?: string;
  bio?: string;
  profilePicture?: string;
}) => {
  return apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

export const getUserStats = async () => {
  return apiRequest("/profile/stats");
};
