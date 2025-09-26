'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  PlusCircle, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Eye, 
  TrendingUp,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { getUserStats, getUserPosts } from '@/lib/api';

interface Stats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
}

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentPosts();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const data = await getUserPosts(1, 3);
      setRecentPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const StatCard = ({ icon: Icon, title, value, color, isLoading }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              {formatDate(new Date().toISOString())}
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          title="Total Posts"
          value={stats.totalPosts}
          color="bg-blue-500"
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={Heart}
          title="Total Likes"
          value={stats.totalLikes}
          color="bg-red-500"
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={MessageCircle}
          title="Total Comments"
          value={stats.totalComments}
          color="bg-green-500"
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={Eye}
          title="Total Views"
          value={stats.totalViews}
          color="bg-purple-500"
          isLoading={isLoadingStats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Recent Posts</span>
                </h2>
                <Link
                  href="/dashboard/posts"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {isLoadingPosts ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-6">
                  {recentPosts.map((post, index) => (
                    <div key={post.id} className={`${index !== recentPosts.length - 1 ? 'pb-6 border-b border-gray-100' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link
                            href={`/blogs/${post.id}`}
                            className="block hover:text-blue-600 transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{post.likesCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{post.commentsCount}</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Start sharing your stories with the world!</p>
                  <Link
                    href="/dashboard/posts/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Your First Post</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Profile */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </h3>
            <div className="text-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <h4 className="font-medium text-gray-900 mb-1">{user?.username}</h4>
              <p className="text-sm text-gray-600 mb-4">
                {user?.bio || 'No bio yet'}
              </p>
              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/posts/new"
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Write New Post</span>
              </Link>
              <Link
                href="/dashboard/posts"
                className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Manage Posts</span>
              </Link>
              <Link
                href="/blogs"
                className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Browse Stories</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}