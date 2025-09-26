'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, BookOpen, ArrowRight } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { getAllPosts } from '@/lib/api';
import Link from 'next/link';

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

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const data = await getAllPosts(page, 6, search);
      
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

  const handleSearch = async () => {
    await fetchPosts(1, searchTerm);
  };

  const handleLoadMore = async () => {
    await fetchPosts(currentPage + 1, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Share Your <span className="text-yellow-400">Stories</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Join our community of writers and readers. Discover amazing stories, 
            share your thoughts, and connect with like-minded people.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-8">
            <div className="flex flex-col items-center">
              <BookOpen className="h-8 w-8 mb-2 text-yellow-400" />
              <div className="text-2xl font-bold">1,000+</div>
              <div className="text-sm opacity-80">Stories Published</div>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 mb-2 text-yellow-400" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm opacity-80">Active Writers</div>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="h-8 w-8 mb-2 text-yellow-400" />
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm opacity-80">Monthly Reads</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Start Writing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/blogs"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Explore Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Discover Amazing Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Search through thousands of stories from our community of writers
            </p>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for stories, topics, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 pl-12 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fresh content from our community of passionate writers
            </p>
          </div>

          {isLoading && currentPage === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load More Stories</span>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share your story!'}
              </p>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Writing
              </Link>
            </div>
          )}

          {posts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/blogs"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-2"
              >
                <span>View All Stories</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}