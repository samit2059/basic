'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Eye, ArrowLeft, Share2, Bookmark, Tag, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import { getPostById } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    profilePicture?: string;
    bio?: string;
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

export default function BlogPostPage() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await getPostById(id);
      setPost(data.post);
    } catch (error: any) {
      setError(error.message || 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The post you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link
              href="/blogs"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Stories</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === post.author.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/blogs"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Stories</span>
          </Link>
        </div>

        {/* Main Content */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Image */}
          {post.image && (
            <div className="relative h-64 md:h-80 w-full">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blogs?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author & Meta Info */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <Link href={`/profile/${post.author.id}`} className="flex items-center space-x-3">
                  {post.author.profilePicture ? (
                    <Image
                      src={post.author.profilePicture}
                      alt={post.author.username}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                      {post.author.username}
                    </p>
                    {post.author.bio && (
                      <p className="text-sm text-gray-500">{post.author.bio}</p>
                    )}
                  </div>
                </Link>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {post.viewsCount !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.viewsCount} views</span>
                    </div>
                  )}
                  <span>{formatReadingTime(post.content)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-8">
              <LikeButton 
                postId={post.id} 
                initialLikesCount={post.likesCount}
                initialIsLiked={post.isLiked}
              />

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                {isOwner && (
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Edit Post</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div 
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Updated Date */}
            {post.updatedAt !== post.createdAt && (
              <div className="text-sm text-gray-500 italic border-t border-gray-200 pt-4">
                Last updated: {formatDate(post.updatedAt)}
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}