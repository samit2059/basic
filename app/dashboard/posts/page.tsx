'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, Search, Edit, Trash2, Eye, Calendar, Loader } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { getUserPosts, deletePost } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
  image?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  isLiked?: boolean;
}

export default function UserPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search term
    if (searchTerm) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchTerm, posts]);

  const fetchPosts = async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await getUserPosts(page, 12);
      
      if (page === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      
      setHasMore(data.pagination?.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(postId);
      await deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLoadMore = () => {
    fetchPosts(currentPage + 1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
            <p className="text-gray-600 mt-1">
              Manage and organize your published stories
            </p>
          </div>
          <Link
            href="/dashboard/posts/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 shadow-md"
          >
            <PlusCircle className="h-5 w-5" />
            <span>New Post</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search your posts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Stats Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, post) => sum + post.likesCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, post) => sum + post.commentsCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading && currentPage === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative">
                <BlogCard
                  post={post}
                  showActions={true}
                  onDelete={handleDeletePost}
                />
                {deleteLoading === post.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <Loader className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !searchTerm && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Posts</span>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white rounded-lg shadow-md p-12 max-w-md mx-auto">
            <PlusCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start sharing your stories with the world!'}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/posts/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Your First Post</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mt-8 text-center text-gray-500">
          <p>
            {filteredPosts.length === 0
              ? `No posts found for "${searchTerm}"`
              : `Found ${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'} matching "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  );
}