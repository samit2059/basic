'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { getAllPosts } from '@/lib/api';

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

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Extract unique tags from posts
    const tags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();
    setAllTags(tags);
  }, [posts]);

  const fetchPosts = async (page = 1, search = '', tag = '') => {
    try {
      setIsLoading(true);
      const querySearch = search || (tag ? `#${tag}` : '');
      const data = await getAllPosts(page, 12, querySearch);
      
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPosts(1, searchTerm, selectedTag);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    fetchPosts(1, searchTerm, tag);
  };

  const handleLoadMore = () => {
    fetchPosts(currentPage + 1, searchTerm, selectedTag);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setCurrentPage(1);
    fetchPosts(1, '', '');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing stories from our community of writers. 
            Search by topic, author, or browse by category.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Tag Filter */}
            <div className="lg:w-64">
              <select
                value={selectedTag}
                onChange={(e) => handleTagFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
              
              {(searchTerm || selectedTag) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedTag) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      handleSearch();
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Category: {selectedTag}
                  <button
                    onClick={() => handleTagFilter('')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${posts.length} ${posts.length === 1 ? 'story' : 'stories'} found`}
          </p>
        </div>

        {/* Posts Grid */}
        {isLoading && currentPage === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(12)].map((_, i) => (
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
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No stories found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedTag
                ? 'Try adjusting your search terms or filters'
                : 'No stories have been published yet'}
            </p>
            {(searchTerm || selectedTag) && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Stories
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}