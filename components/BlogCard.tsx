import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Eye, Heart, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

interface BlogCardProps {
  post: BlogPost;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, showActions = false, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const isOwner = isAuthenticated && user?.id === post.author.id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getExcerpt = (content: string, maxLength = 150) => {
    if (post.excerpt) return post.excerpt;
    const stripped = content.replace(/<[^>]*>/g, '');
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
  };

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {post.image && (
        <div className="relative h-48 w-full">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            {post.author.profilePicture ? (
              <Image
                src={post.author.profilePicture}
                alt={post.author.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{post.author.username}</p>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Title and Excerpt */}
        <Link href={`/blogs/${post.id}`} className="block group">
          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {getExcerpt(post.content)}
          </p>
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {post.viewsCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{post.viewsCount}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Heart className={`h-4 w-4 ${post.isLiked ? 'text-red-500 fill-current' : ''}`} />
              <span>{post.likesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </div>
          </div>

          {showActions && isOwner && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/dashboard/posts/${post.id}/edit`}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;