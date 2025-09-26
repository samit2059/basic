'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toggleLike, getPostLikes } from '@/lib/api';

interface LikeButtonProps {
  postId: string;
  initialLikesCount?: number;
  initialIsLiked?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikesCount = 0,
  initialIsLiked = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikeStatus();
    }
  }, [postId, isAuthenticated]);

  const fetchLikeStatus = async () => {
    try {
      const data = await getPostLikes(postId);
      setLikesCount(data.count);
      setIsLiked(data.isLiked);
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show message
      window.location.href = '/login';
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Optimistically update UI
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
      
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      // Make API call
      const response = await toggleLike(postId);
      
      // Update with actual values from server
      setLikesCount(response.count);
      setIsLiked(response.isLiked);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggleLike}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          isLiked
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        } ${!isAuthenticated ? 'cursor-pointer' : ''} ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={!isAuthenticated ? 'Login to like this post' : isLiked ? 'Unlike this post' : 'Like this post'}
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Heart
            className={`h-4 w-4 transition-all duration-200 ${
              isLiked ? 'fill-current text-red-600' : ''
            }`}
          />
        )}
        <span className="font-medium">{likesCount}</span>
        <span className="text-sm">{likesCount === 1 ? 'Like' : 'Likes'}</span>
      </button>

      {!isAuthenticated && (
        <p className="text-xs text-gray-500">
          <a href="/login" className="text-blue-600 hover:text-blue-700">
            Login
          </a>{' '}
          to like posts
        </p>
      )}
    </div>
  );
};

export default LikeButton;